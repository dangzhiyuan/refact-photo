# PhotoPixel 滤镜图层集成实现

## 1. 图层集成架构

### 1.1 滤镜图层定义

```typescript
// 滤镜图层类型
interface FilterLayer extends BaseLayer {
  type: 'filter';
  content: {
    sourceLayer: Layer; // 源图层引用
    filterState: FilterState; // 滤镜状态
    preview?: SkImage; // 预览缓存
    isVisible: boolean; // 图层可见性
    opacity: number; // 图层透明度
    blendMode: BlendMode; // 混合模式
  };
}

// 滤镜组图层
interface FilterGroupLayer extends BaseLayer {
  type: 'filter_group';
  content: {
    filters: FilterLayer[]; // 滤镜图层组
    sourceLayer: Layer; // 源图层引用
    isCollapsed: boolean; // 是否折叠
    isVisible: boolean; // 组可见性
  };
}
```

### 1.2 图层管理器扩展

```typescript
class LayerManager {
  // 添加滤镜图层
  addFilterLayer(sourceLayerId: string, filter: FilterDefinition): FilterLayer {
    const sourceLayer = this.getLayer(sourceLayerId);
    if (!sourceLayer) throw new Error('Source layer not found');

    const filterLayer: FilterLayer = {
      id: generateId(),
      type: 'filter',
      content: {
        sourceLayer,
        filterState: {
          filterId: filter.id,
          intensity: 1,
          params: {...filter.defaultParams},
        },
        isVisible: true,
        opacity: 1,
        blendMode: 'normal',
      },
      zIndex: this.getTopZIndex() + 1,
    };

    this.layers.set(filterLayer.id, filterLayer);
    return filterLayer;
  }

  // 创建滤镜组
  createFilterGroup(sourceLayerId: string): FilterGroupLayer {
    const sourceLayer = this.getLayer(sourceLayerId);
    if (!sourceLayer) throw new Error('Source layer not found');

    const groupLayer: FilterGroupLayer = {
      id: generateId(),
      type: 'filter_group',
      content: {
        filters: [],
        sourceLayer,
        isCollapsed: false,
        isVisible: true,
      },
      zIndex: this.getTopZIndex() + 1,
    };

    this.layers.set(groupLayer.id, groupLayer);
    return groupLayer;
  }
}
```

## 2. 渲染流程适配

### 2.1 滤镜渲染管理器

```typescript
class FilterRenderManager {
  private filterEngine: FilterEngine;
  private layerManager: LayerManager;

  // 渲染单个滤镜图层
  async renderFilterLayer(layer: FilterLayer): Promise<SkImage> {
    const sourceImage = await this.getSourceImage(layer.content.sourceLayer);

    return this.filterEngine.applyFilter(
      sourceImage,
      layer.content.filterState.filterId,
      layer.content.filterState.intensity,
      layer.content.filterState.params,
    );
  }

  // 渲染滤镜组
  async renderFilterGroup(group: FilterGroupLayer): Promise<SkImage> {
    const sourceImage = await this.getSourceImage(group.content.sourceLayer);
    let result = sourceImage;

    // 按 Z 轴顺序渲染滤镜
    const sortedFilters = [...group.content.filters].sort(
      (a, b) => a.zIndex - b.zIndex,
    );

    for (const filter of sortedFilters) {
      if (!filter.content.isVisible) continue;

      const filtered = await this.renderFilterLayer(filter);
      result = this.compositeImages(
        result,
        filtered,
        filter.content.opacity,
        filter.content.blendMode,
      );
    }

    return result;
  }

  // 合成图像
  private compositeImages(
    base: SkImage,
    overlay: SkImage,
    opacity: number,
    blendMode: BlendMode,
  ): SkImage {
    const surface = SkSurface.Make(base.width(), base.height());
    const canvas = surface.getCanvas();

    // 绘制基础图像
    canvas.drawImage(base, 0, 0);

    // 设置混合模式和透明度
    canvas.save();
    canvas.setBlendMode(blendMode);
    canvas.setAlpha(opacity);

    // 绘制叠加图像
    canvas.drawImage(overlay, 0, 0);
    canvas.restore();

    return surface.makeImageSnapshot();
  }
}
```

### 2.2 预览系统适配

```typescript
class FilterPreviewSystem {
  private previewCache = new Map<string, SkImage>();
  private renderManager: FilterRenderManager;

  // 生成图层预览
  async generateLayerPreview(
    layer: FilterLayer | FilterGroupLayer,
    size: number,
  ): Promise<SkImage> {
    const cacheKey = this.generateCacheKey(layer);
    if (this.previewCache.has(cacheKey)) {
      return this.previewCache.get(cacheKey)!;
    }

    // 创建缩略图
    const preview = await this.createPreview(layer, size);
    this.previewCache.set(cacheKey, preview);

    return preview;
  }

  // 清理特定图层的预览缓存
  clearLayerPreviewCache(layerId: string) {
    const cacheKey = this.generateCacheKey({id: layerId});
    if (this.previewCache.has(cacheKey)) {
      this.previewCache.delete(cacheKey);
    }
  }

  // 监听图层变化
  private handleLayerChange(layer: Layer) {
    this.clearLayerPreviewCache(layer.id);
    // 清理依赖此图层的其他图层的预览
    this.clearDependentPreviews(layer.id);
  }
}
```

## 3. 性能优化策略

### 3.1 渲染优化

```typescript
class FilterRenderOptimizer {
  // 检查是否需要重新渲染
  needsRerender(layer: FilterLayer): boolean {
    return (
      this.hasFilterStateChanged(layer) ||
      this.hasSourceChanged(layer.content.sourceLayer) ||
      this.hasBlendingChanged(layer)
    );
  }

  // 优化渲染顺序
  optimizeRenderOrder(filters: FilterLayer[]): FilterLayer[] {
    return filters.sort((a, b) => {
      // 优先渲染不依赖其他滤镜的图层
      const aDependencies = this.getFilterDependencies(a);
      const bDependencies = this.getFilterDependencies(b);
      return aDependencies.length - bDependencies.length;
    });
  }

  // 批量渲染优化
  async batchRender(filters: FilterLayer[]): Promise<Map<string, SkImage>> {
    const batches = this.createRenderBatches(filters);
    const results = new Map<string, SkImage>();

    for (const batch of batches) {
      await Promise.all(
        batch.map(async filter => {
          const result = await this.renderFilterLayer(filter);
          results.set(filter.id, result);
        }),
      );
    }

    return results;
  }
}
```

### 3.2 缓存策略

```typescript
class FilterCacheStrategy {
  private readonly maxCacheSize = 100 * 1024 * 1024; // 100MB
  private cacheSize = 0;

  // 缓存优先级计算
  calculateCachePriority(layer: FilterLayer): number {
    return (
      layer.content.filterState.intensity * 0.3 + // 强度权重
      (layer.content.isVisible ? 0.4 : 0) + // 可见性权重
      (this.isFrequentlyUsed(layer) ? 0.3 : 0) // 使用频率权重
    );
  }

  // 智能缓存清理
  cleanupCache() {
    if (this.cacheSize <= this.maxCacheSize) return;

    const sortedEntries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.priority - b.priority,
    );

    while (this.cacheSize > this.maxCacheSize * 0.8) {
      const [key, entry] = sortedEntries.shift()!;
      this.cache.delete(key);
      this.cacheSize -= entry.size;
    }
  }
}
```

## 4. 用户界面适配

### 4.1 图层面板集成

```typescript
const FilterLayerPanel: FC<{layer: FilterLayer}> = ({layer}) => {
  return (
    <View style={styles.layerPanel}>
      <LayerVisibilityToggle
        isVisible={layer.content.isVisible}
        onChange={handleVisibilityChange}
      />

      <FilterThumbnail
        source={layer.content.preview}
        style={styles.thumbnail}
      />

      <View style={styles.controls}>
        <OpacitySlider
          value={layer.content.opacity}
          onChange={handleOpacityChange}
        />

        <BlendModeSelector
          value={layer.content.blendMode}
          onChange={handleBlendModeChange}
        />

        <IntensitySlider
          value={layer.content.filterState.intensity}
          onChange={handleIntensityChange}
        />
      </View>
    </View>
  );
};
```

### 4.2 图层组管理

```typescript
const FilterGroupPanel: FC<{group: FilterGroupLayer}> = ({group}) => {
  return (
    <View style={styles.groupPanel}>
      <GroupHeader
        isCollapsed={group.content.isCollapsed}
        onToggle={handleCollapseToggle}
      />

      {!group.content.isCollapsed && (
        <View style={styles.groupContent}>
          {group.content.filters.map(filter => (
            <FilterLayerPanel key={filter.id} layer={filter} />
          ))}

          <AddFilterButton onPress={handleAddFilter} />
        </View>
      )}
    </View>
  );
};
```

## 5. 注意事项

1. **性能优化**

   - 避免不必要的滤镜重渲染
   - 智能管理预览缓存
   - 优化图层组渲染顺序
   - 实现渲染批处理

2. **内存管理**

   - 及时释放未使用的滤镜资源
   - 优化图层预览缓存
   - 监控内存使用情况
   - 实现智能缓存清理

3. **用户体验**

   - 保持实时预览的流畅性
   - 提供清晰的图层层级关系
   - 支持灵活的滤镜组操作
   - 优化滤镜参数调节体验

4. **可维护性**
   - 清晰的图层依赖关系
   - 统一的事件处理机制
   - 模块化的代码组织
   - 完善的错误处理
