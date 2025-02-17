# PhotoPixel 图层集成实现文档

## 1. 统一图层架构

### 1.1 基础图层接口

```typescript
// 基础图层接口
interface BaseLayer {
  id: string;
  type: LayerType;
  name: string;
  zIndex: number;
  isVisible: boolean;
  opacity: number;
  blendMode: BlendMode;
  bounds: Rect;
  transform: Transform;
  mask?: Layer;
  clippingMask?: Layer;
}

// 图层类型枚举
type LayerType =
  | 'image'
  | 'text'
  | 'sticker'
  | 'doodle'
  | 'group'
  | 'adjustment';

// 图层组
interface LayerGroup extends BaseLayer {
  type: 'group';
  children: Layer[];
  isCollapsed: boolean;
}

// 统一的变换接口
interface Transform {
  position: Point;
  scale: {x: number; y: number};
  rotation: number;
  origin: Point;
}
```

### 1.2 图层适配器

```typescript
// 贴纸图层适配器
class StickerLayerAdapter implements BaseLayer {
  constructor(private stickerLayer: StickerLayer) {}

  get id() {
    return this.stickerLayer.id;
  }

  get type() {
    return 'sticker' as const;
  }

  get transform() {
    return this.stickerLayer.content.transform;
  }

  set transform(value: Transform) {
    this.stickerLayer.content.transform = value;
  }

  get isVisible() {
    return this.stickerLayer.content.isVisible;
  }

  set isVisible(value: boolean) {
    this.stickerLayer.content.isVisible = value;
  }

  get opacity() {
    return this.stickerLayer.content.opacity;
  }

  set opacity(value: number) {
    this.stickerLayer.content.opacity = value;
  }

  get blendMode() {
    return this.stickerLayer.content.blendMode;
  }

  set blendMode(value: BlendMode) {
    this.stickerLayer.content.blendMode = value;
  }
}

// 文字图层适配器
class TextLayerAdapter implements BaseLayer {
  constructor(private textLayer: TextLayer) {}

  get id() {
    return this.textLayer.id;
  }

  get type() {
    return 'text' as const;
  }

  get transform() {
    return this.textLayer.content.transform;
  }

  set transform(value: Transform) {
    this.textLayer.content.transform = value;
  }

  get isVisible() {
    return this.textLayer.content.isVisible;
  }

  set isVisible(value: boolean) {
    this.textLayer.content.isVisible = value;
  }

  // ... 其他属性适配
}

// 涂鸦图层适配器
class DoodleLayerAdapter implements BaseLayer {
  constructor(private doodleLayer: DoodleLayer) {}

  get id() {
    return this.doodleLayer.id;
  }

  get type() {
    return 'doodle' as const;
  }

  get transform() {
    // 涂鸦图层可能需要特殊的变换处理
    return {
      position: {x: 0, y: 0},
      scale: {x: 1, y: 1},
      rotation: 0,
      origin: {x: 0, y: 0},
    };
  }

  // ... 其他属性适配
}
```

## 2. 图层管理系统

### 2.1 统一图层管理器

```typescript
class LayerManager {
  private layers: Map<string, BaseLayer> = new Map();
  private layerOrder: string[] = [];

  // 添加图层
  addLayer(layer: BaseLayer) {
    this.layers.set(layer.id, layer);
    this.layerOrder.push(layer.id);
    this.updateZIndices();
  }

  // 创建特定类型的图层
  createLayer(type: LayerType, options: any): BaseLayer {
    let layer: BaseLayer;

    switch (type) {
      case 'sticker':
        const stickerLayer = this.stickerManager.createStickerLayer(options);
        layer = new StickerLayerAdapter(stickerLayer);
        break;
      case 'text':
        const textLayer = this.textManager.createTextLayer(options);
        layer = new TextLayerAdapter(textLayer);
        break;
      case 'doodle':
        const doodleLayer = this.doodleManager.createDoodleLayer(options);
        layer = new DoodleLayerAdapter(doodleLayer);
        break;
      // ... 其他图层类型
    }

    this.addLayer(layer);
    return layer;
  }

  // 更新图层顺序
  reorderLayer(layerId: string, newIndex: number) {
    const currentIndex = this.layerOrder.indexOf(layerId);
    if (currentIndex === -1) return;

    this.layerOrder.splice(currentIndex, 1);
    this.layerOrder.splice(newIndex, 0, layerId);
    this.updateZIndices();
  }

  // 更新所有图层的 zIndex
  private updateZIndices() {
    this.layerOrder.forEach((id, index) => {
      const layer = this.layers.get(id);
      if (layer) {
        layer.zIndex = index;
      }
    });
  }
}
```

### 2.2 图层渲染系统

```typescript
class LayerRenderer {
  // 渲染所有图层
  renderLayers(canvas: SkCanvas, layers: BaseLayer[]) {
    // 按 zIndex 排序
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

    for (const layer of sortedLayers) {
      if (!layer.isVisible) continue;

      canvas.save();

      // 应用图层通用变换
      this.applyLayerTransform(canvas, layer);

      // 应用混合模式和透明度
      canvas.setBlendMode(layer.blendMode);
      canvas.setAlpha(layer.opacity);

      // 根据图层类型调用相应的渲染器
      switch (layer.type) {
        case 'sticker':
          this.stickerRenderer.renderSticker(canvas, layer as StickerLayer);
          break;
        case 'text':
          this.textRenderer.renderText(canvas, layer as TextLayer);
          break;
        case 'doodle':
          this.doodleRenderer.renderDoodle(canvas, layer as DoodleLayer);
          break;
      }

      canvas.restore();
    }
  }

  // 应用图层变换
  private applyLayerTransform(canvas: SkCanvas, layer: BaseLayer) {
    const {position, scale, rotation, origin} = layer.transform;

    canvas.translate(position.x, position.y);
    canvas.translate(origin.x, origin.y);
    canvas.rotate(rotation);
    canvas.scale(scale.x, scale.y);
    canvas.translate(-origin.x, -origin.y);
  }
}
```

## 3. 图层交互集成

### 3.1 统一的选择系统

```typescript
class LayerSelectionManager {
  private selectedLayers: Set<string> = new Set();

  // 选择图层
  selectLayer(layerId: string, multiSelect: boolean = false) {
    if (!multiSelect) {
      this.selectedLayers.clear();
    }
    this.selectedLayers.add(layerId);
    this.updateLayerSelection();
  }

  // 更新图层选择状态
  private updateLayerSelection() {
    this.layerManager.getAllLayers().forEach(layer => {
      switch (layer.type) {
        case 'sticker':
          (layer as StickerLayer).content.isSelected = this.selectedLayers.has(
            layer.id,
          );
          break;
        case 'text':
          (layer as TextLayer).content.isSelected = this.selectedLayers.has(
            layer.id,
          );
          break;
        case 'doodle':
          // 涂鸦图层可能需要特殊处理
          break;
      }
    });
  }
}
```

### 3.2 统一的变换系统

```typescript
class LayerTransformManager {
  // 应用变换
  applyTransform(layerId: string, transform: Partial<Transform>) {
    const layer = this.layerManager.getLayer(layerId);
    if (!layer) return;

    // 更新图层变换
    layer.transform = {
      ...layer.transform,
      ...transform,
    };

    // 特殊处理
    switch (layer.type) {
      case 'sticker':
        this.updateStickerBounds(layer as StickerLayer);
        break;
      case 'text':
        this.updateTextMetrics(layer as TextLayer);
        break;
      case 'doodle':
        this.updateDoodleBounds(layer as DoodleLayer);
        break;
    }
  }

  // 处理手势变换
  handleTransformGesture(
    gesture: TransformGesture,
    layer: BaseLayer,
  ): Partial<Transform> {
    // 根据手势计算变换
    const transform: Partial<Transform> = {
      position: {
        x: layer.transform.position.x + gesture.translation.x,
        y: layer.transform.position.y + gesture.translation.y,
      },
      scale: {
        x: layer.transform.scale.x * gesture.scale,
        y: layer.transform.scale.y * gesture.scale,
      },
      rotation: layer.transform.rotation + gesture.rotation,
    };

    return transform;
  }
}
```

## 4. 性能优化

### 4.1 渲染优化

```typescript
class LayerRenderOptimizer {
  private dirtyLayers: Set<string> = new Set();
  private layerCache: Map<string, SkImage> = new Map();

  // 标记需要重新渲染的图层
  markLayerDirty(layerId: string) {
    this.dirtyLayers.add(layerId);
  }

  // 优化渲染
  optimizeRendering(canvas: SkCanvas, layers: BaseLayer[]) {
    layers.forEach(layer => {
      if (this.shouldRenderLayer(layer)) {
        // 重新渲染并缓存
        const cache = this.renderToCache(layer);
        this.layerCache.set(layer.id, cache);
        this.dirtyLayers.delete(layer.id);
      }

      // 使用缓存绘制
      const cache = this.layerCache.get(layer.id);
      if (cache) {
        this.drawCachedLayer(canvas, layer, cache);
      }
    });
  }

  // 检查是否需要重新渲染
  private shouldRenderLayer(layer: BaseLayer): boolean {
    if (this.dirtyLayers.has(layer.id)) return true;

    // 检查特定类型的更新条件
    switch (layer.type) {
      case 'sticker':
        return this.checkStickerUpdate(layer as StickerLayer);
      case 'text':
        return this.checkTextUpdate(layer as TextLayer);
      case 'doodle':
        return this.checkDoodleUpdate(layer as DoodleLayer);
      default:
        return false;
    }
  }
}
```

### 4.2 内存管理

```typescript
class LayerMemoryManager {
  private readonly MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
  private currentCacheSize = 0;

  // 管理缓存大小
  manageCacheSize(layerCache: Map<string, SkImage>) {
    if (this.currentCacheSize <= this.MAX_CACHE_SIZE) return;

    // 按最近使用时间排序
    const sortedEntries = Array.from(layerCache.entries()).sort(
      ([, a], [, b]) => a.lastUsed - b.lastUsed,
    );

    // 移除最旧的缓存直到大小合适
    while (this.currentCacheSize > this.MAX_CACHE_SIZE * 0.8) {
      const [key, entry] = sortedEntries.shift()!;
      layerCache.delete(key);
      this.currentCacheSize -= entry.size;
    }
  }
}
```

## 5. 注意事项

1. **图层一致性**

   - 确保所有图层类型遵循统一的接口
   - 正确处理图层特有的属性和行为
   - 维护图层状态的同步
   - 处理图层间的依赖关系

2. **性能优化**

   - 优化图层缓存策略
   - 减少不必要的重绘
   - 控制内存使用
   - 处理大量图层的性能

3. **交互处理**

   - 统一的选择机制
   - 一致的变换行为
   - 平滑的动画效果
   - 准确的碰撞检测

4. **错误处理**
   - 图层状态恢复
   - 变换错误处理
   - 渲染失败处理
   - 内存不足处理
