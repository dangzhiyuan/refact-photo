# PhotoPixel 模块集成指南

## 1. 图层系统集成

### 1.1 与滤镜系统集成

```typescript
// 图层-滤镜集成管理器
class LayerFilterIntegration {
  private layerManager: LayerManager;
  private filterManager: FilterManager;
  private eventBus: EventBus;

  // 应用滤镜到图层
  async applyFilterToLayer(layerId: string, filterId: string): Promise<void> {
    const layer = this.layerManager.getLayer(layerId);
    const filter = this.filterManager.getFilter(filterId);

    if (!layer || !filter) {
      throw new Error('Layer or filter not found');
    }

    // 创建滤镜图层
    const filterLayer = await this.createFilterLayer(layer, filter);

    // 添加到图层系统
    this.layerManager.addLayer(filterLayer);

    // 发送事件通知
    this.eventBus.emit('filter.applied', {
      layerId,
      filterId,
      filterLayer: filterLayer.id,
    });
  }

  // 创建滤镜图层
  private async createFilterLayer(
    sourceLayer: Layer,
    filter: Filter,
  ): Promise<FilterLayer> {
    // 克隆源图层属性
    const filterLayer: FilterLayer = {
      id: generateId(),
      type: 'filter',
      name: `${sourceLayer.name}_${filter.name}`,
      content: {
        sourceLayer: sourceLayer.id,
        filter: filter.id,
        intensity: 1,
        preview: null,
      },
      transform: {...sourceLayer.transform},
      visible: true,
      opacity: 1,
      blendMode: 'normal',
    };

    // 生成预览
    filterLayer.content.preview = await this.generateFilterPreview(
      sourceLayer,
      filter,
    );

    return filterLayer;
  }
}
```

### 1.2 与贴纸系统集成

```typescript
// 图层-贴纸集成管理器
class LayerStickerIntegration {
  private layerManager: LayerManager;
  private stickerManager: StickerManager;
  private eventBus: EventBus;

  // 添加贴纸到图层
  async addStickerToLayer(
    layerId: string,
    stickerId: string,
    position: Point,
  ): Promise<void> {
    const layer = this.layerManager.getLayer(layerId);
    const sticker = await this.stickerManager.loadSticker(stickerId);

    // 创建贴纸图层
    const stickerLayer = this.createStickerLayer(sticker, position);

    // 添加到图层组
    if (layer.type === 'group') {
      this.layerManager.addToGroup(layer.id, stickerLayer);
    } else {
      // 创建新的图层组
      const group = this.layerManager.createGroup([layer, stickerLayer]);
      this.layerManager.replaceLayer(layer.id, group);
    }

    // 发送事件通知
    this.eventBus.emit('sticker.added', {
      layerId,
      stickerId,
      stickerLayer: stickerLayer.id,
    });
  }

  // 处理贴纸变换
  handleStickerTransform(layerId: string, transform: Transform): void {
    const layer = this.layerManager.getLayer(layerId);
    if (layer.type !== 'sticker') return;

    // 更新贴纸变换
    this.layerManager.updateTransform(layerId, transform);

    // 更新贴纸预览
    this.updateStickerPreview(layer);
  }
}
```

### 1.3 与文字系统集成

```typescript
// 图层-文字集成管理器
class LayerTextIntegration {
  private layerManager: LayerManager;
  private textManager: TextManager;
  private eventBus: EventBus;

  // 添加文字图层
  async addTextLayer(
    text: string,
    style: TextStyle,
    position: Point,
  ): Promise<void> {
    // 创建文字图层
    const textLayer = await this.createTextLayer(text, style, position);

    // 添加到图层系统
    this.layerManager.addLayer(textLayer);

    // 发送事件通知
    this.eventBus.emit('text.added', {
      layerId: textLayer.id,
      text,
      style,
    });
  }

  // 更新文字内容
  async updateTextContent(
    layerId: string,
    text: string,
    style?: Partial<TextStyle>,
  ): Promise<void> {
    const layer = this.layerManager.getLayer(layerId);
    if (layer.type !== 'text') return;

    // 更新文字内容
    const updatedLayer = await this.textManager.updateText(layer, text, style);
    this.layerManager.updateLayer(layerId, updatedLayer);

    // 发送事件通知
    this.eventBus.emit('text.updated', {
      layerId,
      text,
      style,
    });
  }
}
```

## 2. 历史记录系统集成

### 2.1 与图层系统集成

```typescript
// 历史-图层集成管理器
class HistoryLayerIntegration {
  private historyManager: HistoryManager;
  private layerManager: LayerManager;
  private eventBus: EventBus;

  // 记录图层操作
  recordLayerOperation(operation: LayerOperation): void {
    // 创建历史记录
    const historyRecord = this.createHistoryRecord(operation);

    // 添加到历史系统
    this.historyManager.addRecord(historyRecord);

    // 发送事件通知
    this.eventBus.emit('history.recorded', {
      recordId: historyRecord.id,
      operation,
    });
  }

  // 还原图层操作
  async undoLayerOperation(recordId: string): Promise<void> {
    const record = this.historyManager.getRecord(recordId);
    if (!record) return;

    // 还原图层状态
    await this.restoreLayerState(record.operation);

    // 发送事件通知
    this.eventBus.emit('history.undone', {
      recordId,
      operation: record.operation,
    });
  }

  // 重做图层操作
  async redoLayerOperation(recordId: string): Promise<void> {
    const record = this.historyManager.getRecord(recordId);
    if (!record) return;

    // 重新应用图层操作
    await this.applyLayerOperation(record.operation);

    // 发送事件通知
    this.eventBus.emit('history.redone', {
      recordId,
      operation: record.operation,
    });
  }
}
```

### 2.2 与滤镜系统集成

```typescript
// 历史-滤镜集成管理器
class HistoryFilterIntegration {
  private historyManager: HistoryManager;
  private filterManager: FilterManager;
  private eventBus: EventBus;

  // 记录滤镜操作
  recordFilterOperation(operation: FilterOperation): void {
    // 创建历史记录
    const historyRecord = this.createFilterHistoryRecord(operation);

    // 添加到历史系统
    this.historyManager.addRecord(historyRecord);

    // 发送事件通知
    this.eventBus.emit('history.filter.recorded', {
      recordId: historyRecord.id,
      operation,
    });
  }

  // 还原滤镜操作
  async undoFilterOperation(recordId: string): Promise<void> {
    const record = this.historyManager.getRecord(recordId);
    if (!record || record.type !== 'filter') return;

    // 还原滤镜状态
    await this.restoreFilterState(record.operation);

    // 发送事件通知
    this.eventBus.emit('history.filter.undone', {
      recordId,
      operation: record.operation,
    });
  }
}
```

## 3. 资源系统集成

### 3.1 与滤镜系统集成

```typescript
// 资源-滤镜集成管理器
class ResourceFilterIntegration {
  private resourceManager: ResourceManager;
  private filterManager: FilterManager;
  private eventBus: EventBus;

  // 加载滤镜资源
  async loadFilterResources(filterId: string): Promise<void> {
    const filter = this.filterManager.getFilter(filterId);
    if (!filter) return;

    // 加载滤镜着色器
    await this.resourceManager.loadShader(filter.shaderId);

    // 加载滤镜预设
    await this.resourceManager.loadPresets(filter.presetIds);

    // 发送事件通知
    this.eventBus.emit('resource.filter.loaded', {
      filterId,
      resources: {
        shader: filter.shaderId,
        presets: filter.presetIds,
      },
    });
  }

  // 释放滤镜资源
  async releaseFilterResources(filterId: string): Promise<void> {
    const filter = this.filterManager.getFilter(filterId);
    if (!filter) return;

    // 释放资源
    await this.resourceManager.releaseResources([
      filter.shaderId,
      ...filter.presetIds,
    ]);

    // 发送事件通知
    this.eventBus.emit('resource.filter.released', {
      filterId,
    });
  }
}
```

### 3.2 与贴纸系统集成

```typescript
// 资源-贴纸集成管理器
class ResourceStickerIntegration {
  private resourceManager: ResourceManager;
  private stickerManager: StickerManager;
  private eventBus: EventBus;

  // 预加载贴纸资源
  async preloadStickerResources(
    categoryId: string,
    options?: PreloadOptions,
  ): Promise<void> {
    const stickers = await this.stickerManager.getCategoryStickers(categoryId);

    // 创建预加载任务
    const tasks = stickers.map(sticker => ({
      id: sticker.id,
      priority: this.calculatePriority(sticker, options),
      resources: this.getStickerResources(sticker),
    }));

    // 开始预加载
    await this.resourceManager.preloadResources(tasks);

    // 发送事件通知
    this.eventBus.emit('resource.sticker.preloaded', {
      categoryId,
      stickerCount: stickers.length,
    });
  }

  // 清理贴纸资源
  async cleanupStickerResources(options?: CleanupOptions): Promise<void> {
    // 获取未使用的贴纸
    const unusedStickers = await this.findUnusedStickers(options);

    // 释放资源
    for (const sticker of unusedStickers) {
      await this.resourceManager.releaseResources(
        this.getStickerResources(sticker),
      );
    }

    // 发送事件通知
    this.eventBus.emit('resource.sticker.cleaned', {
      stickerCount: unusedStickers.length,
    });
  }
}
```

## 4. 实现示例

### 4.1 添加滤镜到图层

```typescript
// 使用示例
async function applyFilterToImage(
  imageLayerId: string,
  filterId: string,
): Promise<void> {
  const integration = new LayerFilterIntegration(
    layerManager,
    filterManager,
    eventBus,
  );

  try {
    // 开始加载提示
    showLoading('正在应用滤镜...');

    // 应用滤镜
    await integration.applyFilterToLayer(imageLayerId, filterId);

    // 成功提示
    showSuccess('滤镜应用成功');
  } catch (error) {
    // 错误处理
    showError('滤镜应用失败', error);

    // 错误恢复
    await integration.revertFilterApplication(imageLayerId);
  } finally {
    hideLoading();
  }
}
```

### 4.2 添加贴纸到图层组

```typescript
// 使用示例
async function addStickerToGroup(
  groupId: string,
  stickerId: string,
  position: Point,
): Promise<void> {
  const integration = new LayerStickerIntegration(
    layerManager,
    stickerManager,
    eventBus,
  );

  try {
    // 开始加载提示
    showLoading('正在添加贴纸...');

    // 添加贴纸
    await integration.addStickerToLayer(groupId, stickerId, position);

    // 成功提示
    showSuccess('贴纸添加成功');
  } catch (error) {
    // 错误处理
    showError('贴纸添加失败', error);

    // 错误恢复
    await integration.revertStickerAddition(groupId);
  } finally {
    hideLoading();
  }
}
```

### 4.3 更新文字图层

```typescript
// 使用示例
async function updateTextLayer(
  layerId: string,
  text: string,
  style: Partial<TextStyle>,
): Promise<void> {
  const integration = new LayerTextIntegration(
    layerManager,
    textManager,
    eventBus,
  );

  try {
    // 开始更新提示
    showLoading('正在更新文字...');

    // 更新文字
    await integration.updateTextContent(layerId, text, style);

    // 成功提示
    showSuccess('文字更新成功');
  } catch (error) {
    // 错误处理
    showError('文字更新失败', error);

    // 错误恢复
    await integration.revertTextUpdate(layerId);
  } finally {
    hideLoading();
  }
}
```

## 5. 注意事项

1. **模块初始化顺序**

   - 资源系统应最先初始化
   - 图层系统在基础系统之后初始化
   - 功能模块最后初始化
   - 确保依赖关系正确

2. **事件处理**

   - 避免事件循环依赖
   - 处理事件失败情况
   - 实现事件重试机制
   - 清理无用的事件监听

3. **资源管理**

   - 及时释放未使用资源
   - 实现资源预加载策略
   - 处理资源加载失败
   - 优化资源缓存策略

4. **错误处理**
   - 实现操作回滚机制
   - 提供友好的错误提示
   - 记录错误日志
   - 保持系统稳定性
