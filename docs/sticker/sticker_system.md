# PhotoPixel 贴纸系统实现文档

## 1. 系统架构

### 1.1 核心功能模块

- 贴纸引擎：处理贴纸的核心逻辑
- 手势系统：处理贴纸的交互操作
- 资源管理：贴纸资源的加载和缓存
- 渲染系统：贴纸的渲染和合成

### 1.2 基础数据结构

```typescript
// 贴纸图层
interface StickerLayer extends BaseLayer {
  type: 'sticker';
  content: {
    source: string; // 贴纸资源路径
    transform: Transform; // 变换信息
    isSelected: boolean; // 是否选中
    isVisible: boolean; // 是否可见
    opacity: number; // 透明度
    blendMode: BlendMode; // 混合模式
  };
}

// 变换信息
interface Transform {
  position: {
    x: number;
    y: number;
  };
  scale: {
    x: number;
    y: number;
  };
  rotation: number;
  origin: {
    x: number;
    y: number;
  };
}

// 贴纸资源定义
interface StickerDefinition {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  source: string;
  defaultScale: number;
  hotspot?: {
    x: number;
    y: number;
  };
}
```

## 2. 核心功能实现

### 2.1 贴纸管理器

```typescript
class StickerManager {
  private layers: Map<string, StickerLayer> = new Map();
  private selectedLayer: string | null = null;

  // 添加贴纸
  addSticker(definition: StickerDefinition, position: Point): StickerLayer {
    const layer: StickerLayer = {
      id: generateId(),
      type: 'sticker',
      content: {
        source: definition.source,
        transform: {
          position,
          scale: {x: definition.defaultScale, y: definition.defaultScale},
          rotation: 0,
          origin: definition.hotspot || {x: 0.5, y: 0.5},
        },
        isSelected: true,
        isVisible: true,
        opacity: 1,
        blendMode: 'normal',
      },
      zIndex: this.getTopZIndex() + 1,
    };

    this.layers.set(layer.id, layer);
    this.setSelectedLayer(layer.id);
    return layer;
  }

  // 更新贴纸变换
  updateTransform(layerId: string, transform: Partial<Transform>) {
    const layer = this.layers.get(layerId);
    if (!layer) return;

    layer.content.transform = {
      ...layer.content.transform,
      ...transform,
    };
  }

  // 选择贴纸
  setSelectedLayer(layerId: string | null) {
    if (this.selectedLayer) {
      const prevLayer = this.layers.get(this.selectedLayer);
      if (prevLayer) {
        prevLayer.content.isSelected = false;
      }
    }

    this.selectedLayer = layerId;
    if (layerId) {
      const layer = this.layers.get(layerId);
      if (layer) {
        layer.content.isSelected = true;
      }
    }
  }
}
```

### 2.2 手势控制器

```typescript
class StickerGestureController {
  private initialGestureState: GestureState | null = null;
  private initialTransform: Transform | null = null;

  // 处理手势
  handleGesture(
    gesture: GestureState,
    layer: StickerLayer,
    onUpdate: (transform: Transform) => void,
  ) {
    if (!this.initialGestureState) {
      this.initialGestureState = gesture;
      this.initialTransform = {...layer.content.transform};
      return;
    }

    const transform = this.calculateTransform(
      gesture,
      this.initialGestureState,
      this.initialTransform!,
    );

    onUpdate(transform);
  }

  // 计算变换
  private calculateTransform(
    currentGesture: GestureState,
    initialGesture: GestureState,
    initialTransform: Transform,
  ): Transform {
    // 计算位移
    const deltaX = currentGesture.x - initialGesture.x;
    const deltaY = currentGesture.y - initialGesture.y;

    // 计算缩放
    const scale = currentGesture.scale / initialGesture.scale;

    // 计算旋转
    const rotation = currentGesture.rotation - initialGesture.rotation;

    return {
      position: {
        x: initialTransform.position.x + deltaX,
        y: initialTransform.position.y + deltaY,
      },
      scale: {
        x: initialTransform.scale.x * scale,
        y: initialTransform.scale.y * scale,
      },
      rotation: initialTransform.rotation + rotation,
      origin: initialTransform.origin,
    };
  }
}
```

### 2.3 渲染系统

```typescript
class StickerRenderer {
  // 渲染贴纸
  renderSticker(canvas: SkCanvas, layer: StickerLayer, image: SkImage): void {
    canvas.save();

    // 应用变换
    this.applyTransform(canvas, layer.content.transform);

    // 设置混合模式和透明度
    canvas.setBlendMode(layer.content.blendMode);
    canvas.setAlpha(layer.content.opacity);

    // 绘制贴纸
    canvas.drawImage(image, 0, 0);

    // 如果选中，绘制控制框
    if (layer.content.isSelected) {
      this.drawSelectionFrame(canvas, image.width(), image.height());
    }

    canvas.restore();
  }

  // 应用变换
  private applyTransform(canvas: SkCanvas, transform: Transform) {
    const {position, scale, rotation, origin} = transform;

    canvas.translate(position.x, position.y);
    canvas.rotate(rotation, origin.x, origin.y);
    canvas.scale(scale.x, scale.y);
  }

  // 绘制选择框
  private drawSelectionFrame(canvas: SkCanvas, width: number, height: number) {
    const paint = new Paint();
    paint.setStyle('stroke');
    paint.setColor('#1a73e8');
    paint.setStrokeWidth(2);

    canvas.drawRect({x: 0, y: 0, width, height}, paint);
    this.drawControlPoints(canvas, width, height);
  }
}
```

## 3. 性能优化

### 3.1 资源管理

```typescript
class StickerResourceManager {
  private imageCache = new Map<string, SkImage>();
  private loadingPromises = new Map<string, Promise<SkImage>>();

  // 加载贴纸图片
  async loadStickerImage(source: string): Promise<SkImage> {
    if (this.imageCache.has(source)) {
      return this.imageCache.get(source)!;
    }

    if (this.loadingPromises.has(source)) {
      return this.loadingPromises.get(source)!;
    }

    const loadPromise = this.loadImage(source).then(image => {
      this.imageCache.set(source, image);
      this.loadingPromises.delete(source);
      return image;
    });

    this.loadingPromises.set(source, loadPromise);
    return loadPromise;
  }

  // 清理缓存
  clearUnusedResources(activeSources: Set<string>) {
    for (const [source] of this.imageCache) {
      if (!activeSources.has(source)) {
        this.imageCache.delete(source);
      }
    }
  }
}
```

### 3.2 渲染优化

```typescript
class StickerRenderOptimizer {
  // 检查是否需要重新渲染
  needsRerender(layer: StickerLayer, prevLayer: StickerLayer): boolean {
    return (
      this.hasTransformChanged(
        layer.content.transform,
        prevLayer.content.transform,
      ) ||
      layer.content.opacity !== prevLayer.content.opacity ||
      layer.content.blendMode !== prevLayer.content.blendMode
    );
  }

  // 创建渲染区域
  calculateDirtyRect(layer: StickerLayer): Rect {
    const {position, scale, rotation} = layer.content.transform;
    const margin = 10; // 添加边距以确保完整渲染

    return {
      x: position.x - margin,
      y: position.y - margin,
      width: layer.width * scale.x + margin * 2,
      height: layer.height * scale.y + margin * 2,
    };
  }
}
```

## 4. 用户界面实现

### 4.1 贴纸选择器

```typescript
const StickerSelector: FC = () => {
  const categories = useStickerCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <CategoryList
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <StickerGrid
        category={selectedCategory}
        onSelectSticker={handleStickerSelect}
      />
    </View>
  );
};
```

### 4.2 贴纸编辑器

```typescript
const StickerEditor: FC<{layer: StickerLayer}> = ({layer}) => {
  return (
    <View style={styles.editorContainer}>
      <OpacityControl
        value={layer.content.opacity}
        onChange={handleOpacityChange}
      />

      <BlendModeSelector
        value={layer.content.blendMode}
        onChange={handleBlendModeChange}
      />

      <TransformControls
        transform={layer.content.transform}
        onChange={handleTransformChange}
      />

      <ActionButtons
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onFlip={handleFlip}
      />
    </View>
  );
};
```

## 5. 系统优势

1. **灵活的交互**

   - 直观的拖拽操作
   - 精确的缩放控制
   - 自由的旋转调节
   - 多点触控支持

2. **高性能处理**

   - 智能资源管理
   - 渲染优化
   - 内存使用优化
   - 流畅的实时预览

3. **丰富的编辑功能**

   - 透明度调节
   - 混合模式
   - 变换控制
   - 图层管理

4. **良好的扩展性**
   - 模块化设计
   - 自定义贴纸支持
   - 灵活的资源管理
   - 可配置的交互行为

## 6. 注意事项

1. **性能考虑**

   - 控制同时渲染的贴纸数量
   - 优化贴纸资源加载
   - 管理内存使用
   - 优化渲染性能

2. **用户体验**

   - 平滑的动画效果
   - 精确的控制响应
   - 直观的操作反馈
   - 合理的默认行为

3. **资源管理**

   - 贴纸资源预加载
   - 智能缓存策略
   - 内存使用监控
   - 资源释放机制

4. **错误处理**
   - 资源加载失败处理
   - 用户操作异常处理
   - 状态恢复机制
   - 友好的错误提示
