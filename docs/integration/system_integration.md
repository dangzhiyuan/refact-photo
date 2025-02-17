# PhotoPixel 系统集成实现文档

## 1. 涂鸦系统集成

### 1.1 涂鸦图层适配

```typescript
// 涂鸦图层适配器
class DoodleLayerAdapter implements BaseLayer {
  constructor(private doodleLayer: DoodleLayer) {}

  // 基础属性实现
  get id() {
    return this.doodleLayer.id;
  }
  get type() {
    return 'doodle' as const;
  }
  get isVisible() {
    return this.doodleLayer.content.isVisible;
  }
  get opacity() {
    return this.doodleLayer.content.opacity;
  }
  get blendMode() {
    return this.doodleLayer.content.blendMode;
  }

  // 特殊处理涂鸦的变换
  get transform(): Transform {
    return {
      position: this.doodleLayer.content.position,
      scale: this.doodleLayer.content.scale,
      rotation: this.doodleLayer.content.rotation,
      origin: {x: 0, y: 0},
    };
  }

  // 更新涂鸦状态
  updateStroke(point: Point, pressure: number) {
    this.doodleLayer.content.currentStroke.push({
      point,
      pressure,
      timestamp: Date.now(),
    });
  }

  // 完成当前笔画
  finishStroke() {
    this.doodleLayer.content.strokes.push(
      this.doodleLayer.content.currentStroke,
    );
    this.doodleLayer.content.currentStroke = [];
  }
}
```

### 1.2 涂鸦渲染集成

```typescript
class DoodleRenderIntegration {
  // 渲染涂鸦图层
  renderDoodleLayer(canvas: SkCanvas, layer: DoodleLayerAdapter) {
    canvas.save();

    // 应用图层变换
    this.applyTransform(canvas, layer.transform);

    // 设置混合模式和透明度
    canvas.setBlendMode(layer.blendMode);
    canvas.setAlpha(layer.opacity);

    // 渲染所有笔画
    this.renderStrokes(canvas, layer.content.strokes);

    // 渲染当前笔画
    if (layer.content.currentStroke.length > 0) {
      this.renderStrokes(canvas, [layer.content.currentStroke]);
    }

    canvas.restore();
  }

  // 渲染笔画
  private renderStrokes(canvas: SkCanvas, strokes: Stroke[][]) {
    const paint = new Paint();
    paint.setStyle('stroke');
    paint.setStrokeCap('round');
    paint.setStrokeJoin('round');

    strokes.forEach(stroke => {
      if (stroke.length < 2) return;

      const path = new Path();
      path.moveTo(stroke[0].point.x, stroke[0].point.y);

      for (let i = 1; i < stroke.length; i++) {
        const p0 = stroke[i - 1].point;
        const p1 = stroke[i].point;

        // 使用压力值调整笔画宽度
        paint.setStrokeWidth(stroke[i].pressure * 10);

        path.lineTo(p1.x, p1.y);
      }

      canvas.drawPath(path, paint);
    });
  }
}
```

## 2. 快捷键系统集成

### 2.1 命令集成

```typescript
class ShortcutCommandIntegration {
  private commandRegistry: Map<string, Command> = new Map();

  // 注册图层相关命令
  registerLayerCommands() {
    this.registerCommand({
      id: 'layer.new',
      execute: () => this.layerManager.createLayer(),
      undo: () => this.layerManager.removeLastLayer(),
      label: '新建图层',
    });

    this.registerCommand({
      id: 'layer.delete',
      execute: () => this.layerManager.deleteSelectedLayers(),
      undo: () => this.layerManager.restoreDeletedLayers(),
      label: '删除图层',
    });
  }

  // 注册涂鸦相关命令
  registerDoodleCommands() {
    this.registerCommand({
      id: 'doodle.undo',
      execute: () => this.doodleManager.undoLastStroke(),
      undo: () => this.doodleManager.redoStroke(),
      label: '撤销笔画',
    });

    this.registerCommand({
      id: 'doodle.clear',
      execute: () => this.doodleManager.clearCanvas(),
      undo: () => this.doodleManager.restoreCanvas(),
      label: '清空画布',
    });
  }
}
```

### 2.2 上下文集成

```typescript
class ShortcutContextIntegration {
  private contextManager: ShortcutContextManager;

  // 注册编辑器上下文
  registerEditorContexts() {
    // 全局上下文
    this.contextManager.registerContext('global', null);

    // 图层编辑上下文
    this.contextManager.registerContext('layer', 'global');

    // 涂鸦上下文
    this.contextManager.registerContext('doodle', 'layer');

    // 文字编辑上下文
    this.contextManager.registerContext('text', 'layer');
  }

  // 处理上下文切换
  handleContextSwitch(newContext: string) {
    // 停用所有上下文
    this.contextManager.deactivateAll();

    // 激活新上下文及其父级
    this.contextManager.activateContext(newContext);
  }
}
```

## 3. 项目管理系统集成

### 3.1 项目状态集成

```typescript
class ProjectStateIntegration {
  private currentProject: Project | null = null;
  private projectHistory: ProjectHistoryManager;

  // 保存项目状态
  async saveProjectState() {
    if (!this.currentProject) return;

    const state: ProjectState = {
      layers: this.layerManager.serializeLayers(),
      selection: this.selectionManager.getSelection(),
      viewport: this.viewportManager.getState(),
      history: this.projectHistory.getState(),
    };

    await this.projectManager.saveState(this.currentProject.id, state);
  }

  // 恢复项目状态
  async restoreProjectState(projectId: string) {
    const state = await this.projectManager.loadState(projectId);
    if (!state) return;

    // 恢复图层
    this.layerManager.deserializeLayers(state.layers);

    // 恢复选择
    this.selectionManager.restoreSelection(state.selection);

    // 恢复视口
    this.viewportManager.setState(state.viewport);

    // 恢复历史记录
    this.projectHistory.setState(state.history);
  }
}
```

### 3.2 自动保存集成

```typescript
class AutoSaveIntegration {
  private autoSaveInterval: number = 5 * 60 * 1000; // 5分钟
  private lastSaveTime: number = 0;

  // 初始化自动保存
  initializeAutoSave() {
    setInterval(() => this.checkAutoSave(), 1000);

    // 监听重要操作
    this.layerManager.on('change', () => this.markDirty());
    this.selectionManager.on('change', () => this.markDirty());
    this.viewportManager.on('change', () => this.markDirty());
  }

  // 检查是否需要自动保存
  private async checkAutoSave() {
    const now = Date.now();
    if (now - this.lastSaveTime >= this.autoSaveInterval) {
      await this.performAutoSave();
      this.lastSaveTime = now;
    }
  }

  // 执行自动保存
  private async performAutoSave() {
    try {
      await this.projectStateIntegration.saveProjectState();
      console.log('Auto save completed');
    } catch (error) {
      console.error('Auto save failed:', error);
    }
  }
}
```

## 4. 性能优化

### 4.1 渲染优化

```typescript
class RenderOptimizationIntegration {
  private dirtyRegions: Set<Rect> = new Set();
  private isRenderScheduled: boolean = false;

  // 标记需要重绘的区域
  markDirty(region: Rect) {
    this.dirtyRegions.add(region);
    this.scheduleRender();
  }

  // 调度渲染
  private scheduleRender() {
    if (this.isRenderScheduled) return;
    this.isRenderScheduled = true;

    requestAnimationFrame(() => {
      this.performRender();
      this.isRenderScheduled = false;
    });
  }

  // 执行渲染
  private performRender() {
    // 合并重叠的脏区域
    const mergedRegions = this.mergeRegions(Array.from(this.dirtyRegions));
    this.dirtyRegions.clear();

    // 只重绘需要更新的区域
    mergedRegions.forEach(region => {
      this.renderRegion(region);
    });
  }
}
```

### 4.2 内存优化

```typescript
class MemoryOptimizationIntegration {
  private readonly MAX_MEMORY_USAGE = 512 * 1024 * 1024; // 512MB
  private memoryUsage: number = 0;

  // 监控内存使用
  monitorMemoryUsage() {
    setInterval(() => {
      const usage = this.calculateMemoryUsage();
      if (usage > this.MAX_MEMORY_USAGE) {
        this.reduceMemoryUsage();
      }
    }, 5000);
  }

  // 减少内存使用
  private async reduceMemoryUsage() {
    // 清理图层缓存
    this.layerManager.clearUnusedCache();

    // 清理历史记录
    this.projectHistory.trimHistory();

    // 清理未使用的资源
    this.resourceManager.clearUnusedResources();

    // 请求垃圾回收
    if (global.gc) {
      global.gc();
    }
  }
}
```

## 5. 注意事项

1. **模块依赖**

   - 明确模块间的依赖关系
   - 避免循环依赖
   - 使用依赖注入
   - 保持模块独立性

2. **性能考虑**

   - 优化渲染性能
   - 控制内存使用
   - 减少不必要的更新
   - 实现增量更新

3. **状态同步**

   - 保持状态一致性
   - 处理并发操作
   - 实现可靠的存储
   - 错误恢复机制

4. **用户体验**
   - 流畅的操作响应
   - 可靠的自动保存
   - 清晰的状态反馈
   - 优雅的错误处理

## 6. 使用示例

### 6.1 图层操作示例

```typescript
// 创建和管理图层
class LayerOperationExample {
  // 创建复合图层
  async createCompositeLayer() {
    // 1. 创建基础图层
    const baseLayer = this.layerManager.createLayer('image', {
      source: 'path/to/image.jpg',
    });

    // 2. 添加滤镜图层
    const filterLayer = this.layerManager.createLayer('filter', {
      filterId: 'vintage',
      intensity: 0.7,
    });

    // 3. 添加涂鸦图层
    const doodleLayer = this.layerManager.createLayer('doodle', {
      brushSize: 5,
      color: '#FF0000',
    });

    // 4. 创建图层组
    const group = this.layerManager.createGroup([
      baseLayer,
      filterLayer,
      doodleLayer,
    ]);

    // 5. 设置混合模式
    filterLayer.blendMode = 'overlay';
    doodleLayer.blendMode = 'multiply';

    return group;
  }

  // 图层变换示例
  async transformLayerGroup() {
    const group = await this.createCompositeLayer();

    // 1. 缩放整个组
    this.transformManager.applyTransform(group.id, {
      scale: {x: 1.5, y: 1.5},
    });

    // 2. 旋转涂鸦图层
    const doodleLayer = group.children[2];
    this.transformManager.applyTransform(doodleLayer.id, {
      rotation: 45,
    });

    // 3. 更新视图
    this.renderManager.markDirty(group.bounds);
  }
}
```

### 6.2 状态管理示例

```typescript
// 项目状态管理
class ProjectStateExample {
  // 处理项目切换
  async switchProject(newProjectId: string) {
    try {
      // 1. 保存当前项目
      if (this.currentProject) {
        await this.saveProjectState();
      }

      // 2. 清理当前状态
      this.cleanupCurrentState();

      // 3. 加载新项目
      await this.loadProject(newProjectId);

      // 4. 初始化编辑器状态
      this.initializeEditorState();
    } catch (error) {
      await this.handleProjectSwitchError(error);
    }
  }

  // 处理协作编辑
  async handleCollaborativeEdit(edit: EditOperation) {
    try {
      // 1. 验证编辑操作
      if (!this.validateEdit(edit)) {
        throw new Error('Invalid edit operation');
      }

      // 2. 应用编辑
      await this.applyEdit(edit);

      // 3. 广播更改
      this.broadcastEdit(edit);

      // 4. 更新历史记录
      this.updateHistory(edit);
    } catch (error) {
      await this.handleEditError(error);
    }
  }
}
```

## 7. 错误处理与恢复机制

### 7.1 错误处理系统

```typescript
class ErrorHandlingSystem {
  private errorHandlers: Map<string, ErrorHandler> = new Map();
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();

  // 注册错误处理器
  registerErrorHandler(
    errorType: string,
    handler: ErrorHandler,
    recovery: RecoveryStrategy,
  ) {
    this.errorHandlers.set(errorType, handler);
    this.recoveryStrategies.set(errorType, recovery);
  }

  // 处理错误
  async handleError(error: ApplicationError) {
    try {
      // 1. 记录错误
      this.logError(error);

      // 2. 查找处理器
      const handler = this.errorHandlers.get(error.type);
      if (!handler) {
        throw new Error(`No handler for error type: ${error.type}`);
      }

      // 3. 执行处理
      await handler.handle(error);

      // 4. 尝试恢复
      await this.attemptRecovery(error);
    } catch (secondaryError) {
      // 处理级联错误
      await this.handleCascadingError(error, secondaryError);
    }
  }

  // 尝试恢复
  private async attemptRecovery(error: ApplicationError) {
    const strategy = this.recoveryStrategies.get(error.type);
    if (!strategy) return;

    try {
      // 1. 创建恢复点
      const checkpoint = await this.createRecoveryCheckpoint();

      // 2. 执行恢复策略
      await strategy.execute(error, checkpoint);

      // 3. 验证恢复结果
      if (await this.validateRecovery(checkpoint)) {
        await this.commitRecovery(checkpoint);
      } else {
        await this.rollbackRecovery(checkpoint);
      }
    } catch (recoveryError) {
      await this.handleRecoveryFailure(error, recoveryError);
    }
  }
}
```

### 7.2 自动恢复策略

```typescript
class AutoRecoverySystem {
  private readonly MAX_RECOVERY_ATTEMPTS = 3;
  private recoveryQueue: RecoveryTask[] = [];

  // 添加恢复任务
  async scheduleRecovery(task: RecoveryTask) {
    this.recoveryQueue.push(task);
    await this.processRecoveryQueue();
  }

  // 处理恢复队列
  private async processRecoveryQueue() {
    while (this.recoveryQueue.length > 0) {
      const task = this.recoveryQueue[0];

      try {
        // 1. 验证任务状态
        if (await this.validateTaskState(task)) {
          // 2. 执行恢复
          await this.executeRecovery(task);
          this.recoveryQueue.shift();
        } else {
          // 3. 处理无效任务
          await this.handleInvalidTask(task);
        }
      } catch (error) {
        // 4. 处理恢复失败
        await this.handleRecoveryError(task, error);
      }
    }
  }

  // 执行恢复
  private async executeRecovery(task: RecoveryTask) {
    let attempts = 0;
    while (attempts < this.MAX_RECOVERY_ATTEMPTS) {
      try {
        // 1. 创建恢复点
        const checkpoint = await this.createCheckpoint();

        // 2. 执行恢复操作
        await task.execute(checkpoint);

        // 3. 验证结果
        if (await this.validateRecoveryResult(task, checkpoint)) {
          return;
        }

        // 4. 回滚失败的尝试
        await this.rollback(checkpoint);
      } catch (error) {
        attempts++;
        if (attempts === this.MAX_RECOVERY_ATTEMPTS) {
          throw error;
        }
        await this.handleRecoveryAttemptFailure(task, error, attempts);
      }
    }
  }
}
```

## 8. 模块通信机制

### 8.1 事件总线系统

```typescript
class EventBusSystem {
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private eventQueue: PriorityQueue<EventData> = new PriorityQueue();

  // 注册事件处理器
  registerHandler(
    eventType: string,
    handler: EventHandler,
    priority: number = 0,
  ) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
  }

  // 发布事件
  async publishEvent(event: EventData) {
    // 1. 添加到队列
    this.eventQueue.enqueue(event, event.priority);

    // 2. 处理队列
    await this.processEventQueue();
  }

  // 处理事件队列
  private async processEventQueue() {
    while (!this.eventQueue.isEmpty()) {
      const event = this.eventQueue.dequeue();
      const handlers = this.eventHandlers.get(event.type) || new Set();

      // 并行处理所有处理器
      await Promise.all(
        Array.from(handlers).map(handler =>
          this.executeHandler(handler, event),
        ),
      );
    }
  }

  // 执行处理器
  private async executeHandler(handler: EventHandler, event: EventData) {
    try {
      await handler.handle(event);
    } catch (error) {
      await this.handleEventError(error, handler, event);
    }
  }
}
```

### 8.2 模块间状态同步

```typescript
class StateSyncManager {
  private stateSubscriptions: Map<string, Set<StateSubscriber>> = new Map();
  private stateCache: Map<string, any> = new Map();

  // 订阅状态更新
  subscribeToState(moduleId: string, subscriber: StateSubscriber) {
    if (!this.stateSubscriptions.has(moduleId)) {
      this.stateSubscriptions.set(moduleId, new Set());
    }
    this.stateSubscriptions.get(moduleId)!.add(subscriber);
  }

  // 更新状态
  async updateState(moduleId: string, newState: any) {
    // 1. 验证状态更新
    if (!this.validateStateUpdate(moduleId, newState)) {
      throw new Error('Invalid state update');
    }

    // 2. 更新缓存
    const oldState = this.stateCache.get(moduleId);
    this.stateCache.set(moduleId, newState);

    // 3. 通知订阅者
    const subscribers = this.stateSubscriptions.get(moduleId) || new Set();
    await this.notifySubscribers(subscribers, moduleId, newState, oldState);
  }

  // 通知订阅者
  private async notifySubscribers(
    subscribers: Set<StateSubscriber>,
    moduleId: string,
    newState: any,
    oldState: any,
  ) {
    const updates = this.calculateStateUpdates(oldState, newState);

    for (const subscriber of subscribers) {
      try {
        await subscriber.onStateChange(moduleId, updates);
      } catch (error) {
        await this.handleSubscriberError(subscriber, error);
      }
    }
  }
}
```

### 8.3 模块间通信示例

```typescript
// 图层变更通知示例
class LayerUpdateExample {
  async handleLayerUpdate(layerId: string, updates: LayerUpdates) {
    // 1. 发布图层更新事件
    await this.eventBus.publishEvent({
      type: 'layer.update',
      data: {layerId, updates},
      priority: 1,
    });

    // 2. 更新相关模块状态
    await this.stateSyncManager.updateState('layerModule', {
      activeLayer: layerId,
      updates,
    });

    // 3. 触发UI更新
    this.uiManager.updateLayerPanel(layerId);

    // 4. 更新历史记录
    await this.historyManager.recordUpdate(layerId, updates);
  }
}

// 工具状态同步示例
class ToolStateSyncExample {
  async switchTool(toolId: string) {
    // 1. 更新工具状态
    await this.stateSyncManager.updateState('toolModule', {
      activeTool: toolId,
    });

    // 2. 更新快捷键上下文
    this.shortcutManager.setContext(toolId);

    // 3. 更新光标
    this.cursorManager.updateCursor(toolId);

    // 4. 通知其他模块
    await this.eventBus.publishEvent({
      type: 'tool.change',
      data: {toolId},
      priority: 2,
    });
  }
}
```
