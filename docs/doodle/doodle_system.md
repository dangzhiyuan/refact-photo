# PhotoPixel 涂鸦系统实现文档

## 1. 系统架构

### 1.1 核心功能模块

- 绘制引擎：处理实时绘制的核心逻辑
- 笔刷系统：笔刷的定义、渲染和管理
- 路径优化：手绘路径的优化和平滑处理
- 图层管理：涂鸦图层的管理和合成

### 1.2 基础数据结构

```typescript
// 涂鸦图层
interface DoodleLayer extends BaseLayer {
  type: 'doodle';
  content: {
    paths: DoodlePath[];
    currentPath?: DoodlePath;
    isVisible: boolean;
    opacity: number;
    blendMode: BlendMode;
  };
}

// 涂鸦路径
interface DoodlePath {
  id: string;
  points: Point[];
  brush: BrushDefinition;
  color: string;
  opacity: number;
  width: number;
  smoothing: number;
  pressure?: number[];
  isEraser: boolean;
}

// 笔刷定义
interface BrushDefinition {
  id: string;
  name: string;
  type: 'pen' | 'marker' | 'pencil' | 'brush' | 'eraser';
  texture?: SkImage;
  spacing: number;
  scattering: number;
  jitter: number;
  preview?: string;
  settings?: {
    [key: string]: number;
  };
}

// 笔刷渲染参数
interface BrushRenderParams {
  position: Point;
  pressure: number;
  angle: number;
  speed: number;
  color: string;
  opacity: number;
  width: number;
}
```

## 2. 核心功能实现

### 2.1 绘制管理器

```typescript
class DoodleManager {
  private layers: Map<string, DoodleLayer> = new Map();
  private activeLayer: string | null = null;
  private brushManager: BrushManager;

  // 创建涂鸦图层
  createDoodleLayer(): DoodleLayer {
    const layer: DoodleLayer = {
      id: generateId(),
      type: 'doodle',
      content: {
        paths: [],
        isVisible: true,
        opacity: 1,
        blendMode: 'normal',
      },
      zIndex: this.getTopZIndex() + 1,
    };

    this.layers.set(layer.id, layer);
    this.setActiveLayer(layer.id);
    return layer;
  }

  // 开始绘制
  startStroke(
    layerId: string,
    point: Point,
    brush: BrushDefinition,
    options: StrokeOptions,
  ) {
    const layer = this.layers.get(layerId);
    if (!layer) return;

    const path: DoodlePath = {
      id: generateId(),
      points: [point],
      brush,
      color: options.color,
      opacity: options.opacity,
      width: options.width,
      smoothing: options.smoothing,
      isEraser: options.isEraser,
    };

    layer.content.currentPath = path;
  }

  // 继续绘制
  continueStroke(layerId: string, point: Point, pressure: number = 1) {
    const layer = this.layers.get(layerId);
    if (!layer || !layer.content.currentPath) return;

    layer.content.currentPath.points.push(point);
    layer.content.currentPath.pressure?.push(pressure);
  }

  // 结束绘制
  endStroke(layerId: string) {
    const layer = this.layers.get(layerId);
    if (!layer || !layer.content.currentPath) return;

    // 优化路径
    layer.content.currentPath.points = this.optimizePath(
      layer.content.currentPath.points,
      layer.content.currentPath.smoothing,
    );

    // 添加到路径列表
    layer.content.paths.push(layer.content.currentPath);
    layer.content.currentPath = undefined;
  }

  // 优化路径
  private optimizePath(points: Point[], smoothing: number): Point[] {
    if (points.length < 3) return points;

    // 使用 Catmull-Rom 样条曲线平滑路径
    return points.reduce((smoothed, point, index, array) => {
      if (index === 0 || index === array.length - 1) {
        smoothed.push(point);
        return smoothed;
      }

      const prev = array[index - 1];
      const next = array[index + 1];

      const smoothX =
        point.x + (next.x - prev.x) * smoothing * (Math.random() * 0.2 + 0.9);
      const smoothY =
        point.y + (next.y - prev.y) * smoothing * (Math.random() * 0.2 + 0.9);

      smoothed.push({x: smoothX, y: smoothY});
      return smoothed;
    }, [] as Point[]);
  }
}
```

### 2.2 笔刷系统

```typescript
class BrushManager {
  private brushes: Map<string, BrushDefinition> = new Map();
  private textureCache: Map<string, SkImage> = new Map();

  // 注册笔刷
  registerBrush(brush: BrushDefinition) {
    this.brushes.set(brush.id, brush);
    if (brush.texture) {
      this.loadTexture(brush.id, brush.texture);
    }
  }

  // 加载笔刷纹理
  private async loadTexture(brushId: string, textureSource: string) {
    try {
      const response = await fetch(textureSource);
      const blob = await response.blob();
      const image = await createImageBitmap(blob);
      const texture = await SkImage.MakeFromBitmap(image);
      this.textureCache.set(brushId, texture);
    } catch (error) {
      console.error(`Failed to load brush texture: ${brushId}`, error);
    }
  }

  // 渲染笔刷笔画
  renderBrushStroke(
    canvas: SkCanvas,
    path: DoodlePath,
    params: BrushRenderParams,
  ) {
    const brush = this.brushes.get(path.brush.id);
    if (!brush) return;

    const paint = new SkPaint();
    paint.setColor(params.color);
    paint.setAlpha(params.opacity);

    switch (brush.type) {
      case 'pen':
        this.renderPenStroke(canvas, path, params, paint);
        break;
      case 'brush':
        this.renderBrushStroke(canvas, path, params, paint);
        break;
      case 'marker':
        this.renderMarkerStroke(canvas, path, params, paint);
        break;
      case 'pencil':
        this.renderPencilStroke(canvas, path, params, paint);
        break;
    }
  }

  // 渲染钢笔笔画
  private renderPenStroke(
    canvas: SkCanvas,
    path: DoodlePath,
    params: BrushRenderParams,
    paint: SkPaint,
  ) {
    paint.setStrokeCap('round');
    paint.setStrokeJoin('round');
    paint.setStyle('stroke');
    paint.setStrokeWidth(params.width);

    const skPath = new SkPath();
    path.points.forEach((point, index) => {
      if (index === 0) {
        skPath.moveTo(point.x, point.y);
      } else {
        skPath.lineTo(point.x, point.y);
      }
    });

    canvas.drawPath(skPath, paint);
  }

  // 渲染毛笔笔画
  private renderBrushStroke(
    canvas: SkCanvas,
    path: DoodlePath,
    params: BrushRenderParams,
    paint: SkPaint,
  ) {
    const texture = this.textureCache.get(path.brush.id);
    if (!texture) return;

    path.points.forEach((point, index) => {
      if (index === 0) return;

      const prev = path.points[index - 1];
      const pressure = path.pressure?.[index] ?? 1;

      // 计算笔画方向和速度
      const angle = Math.atan2(point.y - prev.y, point.x - prev.x);
      const distance = Math.hypot(point.x - prev.x, point.y - prev.y);
      const speed = distance / (1 / 60); // 假设 60fps

      // 应用笔刷纹理
      canvas.save();
      canvas.translate(point.x, point.y);
      canvas.rotate(angle);
      canvas.scale(
        params.width * pressure,
        params.width * pressure * (1 + speed * 0.1),
      );

      paint.setAlpha(params.opacity * (1 - speed * 0.2));
      canvas.drawImage(texture, 0, 0, paint);
      canvas.restore();
    });
  }
}
```

### 2.3 路径优化器

```typescript
class PathOptimizer {
  // 简化路径点
  simplifyPath(points: Point[], tolerance: number): Point[] {
    if (points.length <= 2) return points;

    // 使用 Ramer-Douglas-Peucker 算法简化路径
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const simplified: Point[] = [firstPoint];
    this.rdpRecursive(points, 0, points.length - 1, tolerance, simplified);
    simplified.push(lastPoint);

    return simplified;
  }

  // RDP 递归实现
  private rdpRecursive(
    points: Point[],
    startIndex: number,
    endIndex: number,
    tolerance: number,
    result: Point[],
  ) {
    if (endIndex - startIndex <= 1) return;

    let maxDistance = 0;
    let maxIndex = 0;

    const start = points[startIndex];
    const end = points[endIndex];

    // 找到距离最远的点
    for (let i = startIndex + 1; i < endIndex; i++) {
      const distance = this.pointToLineDistance(points[i], start, end);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    // 如果最大距离大于容差，继续递归
    if (maxDistance > tolerance) {
      this.rdpRecursive(points, startIndex, maxIndex, tolerance, result);
      result.push(points[maxIndex]);
      this.rdpRecursive(points, maxIndex, endIndex, tolerance, result);
    }
  }

  // 计算点到线段的距离
  private pointToLineDistance(point: Point, start: Point, end: Point): number {
    const numerator = Math.abs(
      (end.y - start.y) * point.x -
        (end.x - start.x) * point.y +
        end.x * start.y -
        end.y * start.x,
    );
    const denominator = Math.hypot(end.y - start.y, end.x - start.x);
    return numerator / denominator;
  }
}
```

## 3. 性能优化

### 3.1 渲染优化

```typescript
class DoodleRenderOptimizer {
  private offscreenCache: Map<string, SkImage> = new Map();

  // 更新缓存
  updateCache(layerId: string, paths: DoodlePath[]) {
    const surface = SkSurface.Make(canvasWidth, canvasHeight);
    const canvas = surface.getCanvas();

    // 只重新渲染新的路径
    const lastCachedPath = this.getLastCachedPath(layerId);
    const newPaths = paths.slice(lastCachedPath + 1);

    // 绘制已缓存的内容
    const cachedImage = this.offscreenCache.get(layerId);
    if (cachedImage) {
      canvas.drawImage(cachedImage, 0, 0);
    }

    // 绘制新路径
    newPaths.forEach(path => {
      this.renderPath(canvas, path);
    });

    // 更新缓存
    this.offscreenCache.set(layerId, surface.makeImageSnapshot());
  }

  // 实时绘制当前路径
  renderCurrentPath(
    canvas: SkCanvas,
    path: DoodlePath,
    lastPoint: Point | null,
  ) {
    if (!lastPoint) return;

    const paint = new SkPaint();
    paint.setColor(path.color);
    paint.setAlpha(path.opacity);
    paint.setStrokeWidth(path.width);
    paint.setStrokeCap('round');
    paint.setStyle('stroke');

    canvas.drawLine(
      lastPoint.x,
      lastPoint.y,
      path.points[path.points.length - 1].x,
      path.points[path.points.length - 1].y,
      paint,
    );
  }
}
```

### 3.2 内存管理

```typescript
class DoodleMemoryManager {
  private static readonly MAX_PATHS_PER_LAYER = 1000;
  private static readonly MAX_POINTS_PER_PATH = 1000;

  // 检查和优化内存使用
  optimizeMemoryUsage(layer: DoodleLayer) {
    // 检查路径数量
    if (layer.content.paths.length > DoodleMemoryManager.MAX_PATHS_PER_LAYER) {
      this.mergePaths(layer);
    }

    // 检查点的数量
    layer.content.paths.forEach(path => {
      if (path.points.length > DoodleMemoryManager.MAX_POINTS_PER_PATH) {
        path.points = this.simplifyPath(path.points);
      }
    });
  }

  // 合并路径
  private mergePaths(layer: DoodleLayer) {
    // 找到相似的路径进行合并
    const mergedPaths: DoodlePath[] = [];
    let currentGroup: DoodlePath[] = [];

    layer.content.paths.forEach(path => {
      if (currentGroup.length > 0 && this.canMergePath(currentGroup[0], path)) {
        currentGroup.push(path);
      } else {
        if (currentGroup.length > 0) {
          mergedPaths.push(this.mergePath(currentGroup));
        }
        currentGroup = [path];
      }
    });

    if (currentGroup.length > 0) {
      mergedPaths.push(this.mergePath(currentGroup));
    }

    layer.content.paths = mergedPaths;
  }

  // 检查路径是否可以合并
  private canMergePath(path1: DoodlePath, path2: DoodlePath): boolean {
    return (
      path1.brush.id === path2.brush.id &&
      path1.color === path2.color &&
      path1.width === path2.width &&
      path1.opacity === path2.opacity
    );
  }
}
```

## 4. 用户界面实现

### 4.1 笔刷选择器

```typescript
const BrushSelector: FC = () => {
  const brushes = useBrushes();
  const [selectedBrush, setSelectedBrush] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <ScrollView horizontal style={styles.brushList}>
        {brushes.map(brush => (
          <BrushItem
            key={brush.id}
            brush={brush}
            isSelected={brush.id === selectedBrush}
            onSelect={() => setSelectedBrush(brush.id)}
          />
        ))}
      </ScrollView>

      <BrushSettings
        brush={brushes.find(b => b.id === selectedBrush)}
        onChange={handleSettingsChange}
      />
    </View>
  );
};
```

### 4.2 绘制控制器

```typescript
const DoodleControls: FC = () => {
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState(2);
  const [opacity, setOpacity] = useState(1);

  return (
    <View style={styles.controls}>
      <ColorPicker value={color} onChange={setColor} />

      <Slider
        label="笔画粗细"
        value={width}
        min={1}
        max={50}
        onChange={setWidth}
      />

      <Slider
        label="不透明度"
        value={opacity}
        min={0}
        max={1}
        step={0.01}
        onChange={setOpacity}
      />

      <Button title="清除" onPress={handleClear} />
      <Button title="撤销" onPress={handleUndo} />
    </View>
  );
};
```

## 5. 系统优势

1. **丰富的笔刷系统**

   - 多种笔刷类型
   - 自定义笔刷支持
   - 笔压感应
   - 笔刷预览

2. **高性能绘制**

   - 路径优化
   - 渲染缓存
   - 内存管理
   - 实时预览

3. **自然的绘制体验**

   - 平滑的笔画
   - 压感支持
   - 实时反馈
   - 直观的控制

4. **完善的功能支持**
   - 多图层支持
   - 橡皮擦功能
   - 撤销/重做
   - 路径编辑

## 6. 注意事项

1. **性能考虑**

   - 控制路径复杂度
   - 优化渲染性能
   - 管理内存使用
   - 缓存策略优化

2. **用户体验**

   - 笔画延迟控制
   - 压感映射优化
   - 笔刷预览质量
   - 操作响应时间

3. **资源管理**

   - 笔刷资源加载
   - 纹理缓存控制
   - 内存使用监控
   - 资源释放机制

4. **错误处理**
   - 绘制错误恢复
   - 资源加载失败
   - 内存不足处理
   - 状态同步异常
