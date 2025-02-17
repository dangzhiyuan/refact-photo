# PhotoPixel 历史记录系统实现文档

## 1. 系统架构

### 1.1 核心功能模块

- 操作记录：记录所有可撤销的操作
- 状态管理：管理操作的状态和依赖关系
- 内存优化：优化历史记录的内存使用
- 快照系统：关键状态的快照管理

### 1.2 基础数据结构

```typescript
// 历史记录操作
interface HistoryOperation {
  id: string;
  type: OperationType;
  timestamp: number;
  layerId: string;
  data: OperationData;
  snapshot?: LayerSnapshot;
  dependencies?: string[]; // 依赖的其他操作ID
}

// 操作类型
type OperationType =
  | 'layer_create'
  | 'layer_delete'
  | 'layer_modify'
  | 'layer_reorder'
  | 'layer_transform'
  | 'layer_style'
  | 'text_edit'
  | 'doodle_path'
  | 'sticker_modify'
  | 'filter_apply'
  | 'group_operation';

// 操作数据
type OperationData = {
  before: any;
  after: any;
  params?: any;
};

// 图层快照
interface LayerSnapshot {
  id: string;
  type: LayerType;
  content: any;
  timestamp: number;
  size: number;
}

// 历史记录状态
interface HistoryState {
  operations: HistoryOperation[];
  currentIndex: number;
  snapshots: Map<string, LayerSnapshot>;
  totalSize: number;
}
```

## 2. 核心功能实现

### 2.1 历史记录管理器

```typescript
class HistoryManager {
  private state: HistoryState;
  private maxOperations = 100;
  private maxSnapshotSize = 50 * 1024 * 1024; // 50MB

  constructor(private layerManager: LayerManager) {
    this.state = {
      operations: [],
      currentIndex: -1,
      snapshots: new Map(),
      totalSize: 0,
    };
  }

  // 记录操作
  recordOperation(
    type: OperationType,
    layerId: string,
    data: OperationData,
  ): void {
    // 清除当前位置之后的操作
    if (this.state.currentIndex < this.state.operations.length - 1) {
      this.state.operations = this.state.operations.slice(
        0,
        this.state.currentIndex + 1,
      );
    }

    // 创建新操作
    const operation: HistoryOperation = {
      id: generateId(),
      type,
      timestamp: Date.now(),
      layerId,
      data,
      dependencies: this.getDependencies(layerId, type),
    };

    // 检查是否需要创建快照
    if (this.shouldCreateSnapshot(type, layerId)) {
      operation.snapshot = this.createLayerSnapshot(layerId);
    }

    // 添加操作
    this.state.operations.push(operation);
    this.state.currentIndex++;

    // 优化历史记录大小
    this.optimizeHistory();
  }

  // 撤销操作
  undo(): void {
    if (this.state.currentIndex < 0) return;

    const operation = this.state.operations[this.state.currentIndex];
    this.revertOperation(operation);
    this.state.currentIndex--;
  }

  // 重做操作
  redo(): void {
    if (this.state.currentIndex >= this.state.operations.length - 1) return;

    this.state.currentIndex++;
    const operation = this.state.operations[this.state.currentIndex];
    this.applyOperation(operation);
  }

  // 获取操作依赖
  private getDependencies(
    layerId: string,
    type: OperationType,
  ): string[] | undefined {
    const layer = this.layerManager.getLayer(layerId);
    if (!layer) return undefined;

    const dependencies: string[] = [];

    // 检查图层组依赖
    if (layer.type === 'group') {
      dependencies.push(
        ...(layer as LayerGroup).children.map(child => child.id),
      );
    }

    // 检查蒙版依赖
    if (layer.mask) {
      dependencies.push(layer.mask.id);
    }

    // 检查剪切蒙版依赖
    if (layer.clippingMask) {
      dependencies.push(layer.clippingMask.id);
    }

    return dependencies.length > 0 ? dependencies : undefined;
  }
}
```

### 2.2 操作处理器

```typescript
class OperationHandler {
  // 应用操作
  applyOperation(operation: HistoryOperation): void {
    const layer = this.layerManager.getLayer(operation.layerId);
    if (!layer) return;

    switch (operation.type) {
      case 'layer_create':
        this.handleLayerCreate(operation);
        break;
      case 'layer_delete':
        this.handleLayerDelete(operation);
        break;
      case 'layer_modify':
        this.handleLayerModify(operation);
        break;
      case 'text_edit':
        this.handleTextEdit(operation);
        break;
      case 'doodle_path':
        this.handleDoodlePath(operation);
        break;
      // ... 其他操作类型
    }
  }

  // 处理图层创建
  private handleLayerCreate(operation: HistoryOperation): void {
    const {type, data} = operation.data.after;
    this.layerManager.createLayer(type, data);
  }

  // 处理图层修改
  private handleLayerModify(operation: HistoryOperation): void {
    const layer = this.layerManager.getLayer(operation.layerId);
    if (!layer) return;

    // 如果有快照，直接恢复
    if (operation.snapshot) {
      this.restoreFromSnapshot(layer, operation.snapshot);
      return;
    }

    // 否则应用修改
    const {before, after} = operation.data;
    Object.keys(after).forEach(key => {
      (layer as any)[key] = after[key];
    });
  }

  // 处理文字编辑
  private handleTextEdit(operation: HistoryOperation): void {
    const layer = this.layerManager.getLayer(operation.layerId) as TextLayer;
    if (!layer || layer.type !== 'text') return;

    const {text, style} = operation.data.after;
    layer.content.text = text;
    if (style) {
      layer.content.style = {...layer.content.style, ...style};
    }
  }

  // 处理涂鸦路径
  private handleDoodlePath(operation: HistoryOperation): void {
    const layer = this.layerManager.getLayer(operation.layerId) as DoodleLayer;
    if (!layer || layer.type !== 'doodle') return;

    const {paths} = operation.data.after;
    layer.content.paths = paths;
  }
}
```

### 2.3 快照系统

```typescript
class SnapshotManager {
  private snapshots: Map<string, LayerSnapshot> = new Map();
  private maxSnapshotSize = 50 * 1024 * 1024; // 50MB
  private currentSize = 0;

  // 创建图层快照
  createSnapshot(layer: BaseLayer): LayerSnapshot {
    const snapshot: LayerSnapshot = {
      id: layer.id,
      type: layer.type,
      content: this.serializeLayerContent(layer),
      timestamp: Date.now(),
      size: 0,
    };

    // 计算快照大小
    snapshot.size = this.calculateSnapshotSize(snapshot);

    // 管理快照存储
    this.manageSnapshotStorage(snapshot);

    return snapshot;
  }

  // 序列化图层内容
  private serializeLayerContent(layer: BaseLayer): any {
    switch (layer.type) {
      case 'text':
        return {
          text: (layer as TextLayer).content.text,
          style: (layer as TextLayer).content.style,
        };
      case 'doodle':
        return {
          paths: (layer as DoodleLayer).content.paths,
        };
      case 'sticker':
        return {
          source: (layer as StickerLayer).content.source,
          transform: (layer as StickerLayer).content.transform,
        };
      default:
        return {};
    }
  }

  // 管理快照存储
  private manageSnapshotStorage(snapshot: LayerSnapshot): void {
    // 检查是否超过大小限制
    while (
      this.currentSize + snapshot.size > this.maxSnapshotSize &&
      this.snapshots.size > 0
    ) {
      this.removeOldestSnapshot();
    }

    // 添加新快照
    this.snapshots.set(snapshot.id, snapshot);
    this.currentSize += snapshot.size;
  }

  // 移除最旧的快照
  private removeOldestSnapshot(): void {
    let oldest: LayerSnapshot | null = null;
    for (const snapshot of this.snapshots.values()) {
      if (!oldest || snapshot.timestamp < oldest.timestamp) {
        oldest = snapshot;
      }
    }

    if (oldest) {
      this.snapshots.delete(oldest.id);
      this.currentSize -= oldest.size;
    }
  }
}
```

## 3. 性能优化

### 3.1 内存优化

```typescript
class HistoryMemoryOptimizer {
  private readonly MAX_OPERATIONS = 100;
  private readonly MAX_MEMORY = 100 * 1024 * 1024; // 100MB

  // 优化历史记录
  optimizeHistory(state: HistoryState): void {
    // 检查操作数量
    if (state.operations.length > this.MAX_OPERATIONS) {
      this.pruneOperations(state);
    }

    // 检查内存使用
    if (state.totalSize > this.MAX_MEMORY) {
      this.pruneSnapshots(state);
    }
  }

  // 清理操作
  private pruneOperations(state: HistoryState): void {
    // 保留关键操作
    const criticalOperations = this.findCriticalOperations(state.operations);

    // 移除非关键操作
    state.operations = state.operations.filter(op =>
      criticalOperations.has(op.id),
    );
  }

  // 查找关键操作
  private findCriticalOperations(operations: HistoryOperation[]): Set<string> {
    const critical = new Set<string>();

    operations.forEach(op => {
      // 保留创建和删除操作
      if (op.type === 'layer_create' || op.type === 'layer_delete') {
        critical.add(op.id);
      }

      // 保留有快照的操作
      if (op.snapshot) {
        critical.add(op.id);
      }

      // 保留依赖链
      if (op.dependencies) {
        op.dependencies.forEach(depId => critical.add(depId));
      }
    });

    return critical;
  }
}
```

### 3.2 操作合并

```typescript
class OperationMerger {
  // 尝试合并操作
  tryMergeOperations(
    current: HistoryOperation,
    previous: HistoryOperation,
  ): HistoryOperation | null {
    // 检查是否可以合并
    if (!this.canMergeOperations(current, previous)) {
      return null;
    }

    // 根据操作类型合并
    switch (current.type) {
      case 'text_edit':
        return this.mergeTextOperations(current, previous);
      case 'doodle_path':
        return this.mergeDoodleOperations(current, previous);
      case 'layer_transform':
        return this.mergeTransformOperations(current, previous);
      default:
        return null;
    }
  }

  // 检查操作是否可以合并
  private canMergeOperations(
    current: HistoryOperation,
    previous: HistoryOperation,
  ): boolean {
    return (
      current.type === previous.type &&
      current.layerId === previous.layerId &&
      current.timestamp - previous.timestamp < 1000 // 1秒内的操作
    );
  }

  // 合并文字编辑操作
  private mergeTextOperations(
    current: HistoryOperation,
    previous: HistoryOperation,
  ): HistoryOperation {
    return {
      ...current,
      data: {
        before: previous.data.before,
        after: current.data.after,
      },
    };
  }
}
```

## 4. 用户界面集成

### 4.1 历史面板

```typescript
const HistoryPanel: FC = () => {
  const history = useHistory();
  const [selectedOperation, setSelectedOperation] = useState<string | null>(
    null,
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.operationList}>
        {history.operations.map((operation, index) => (
          <HistoryItem
            key={operation.id}
            operation={operation}
            isSelected={index === history.currentIndex}
            onSelect={() => setSelectedOperation(operation.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.controls}>
        <Button
          title="撤销"
          onPress={history.undo}
          disabled={!history.canUndo}
        />
        <Button
          title="重做"
          onPress={history.redo}
          disabled={!history.canRedo}
        />
        <Button
          title="清除历史"
          onPress={history.clear}
          disabled={history.operations.length === 0}
        />
      </View>
    </View>
  );
};
```

### 4.2 操作预览

```typescript
const OperationPreview: FC<{operation: HistoryOperation}> = ({operation}) => {
  const layer = useLayer(operation.layerId);

  // 渲染预览
  const renderPreview = () => {
    switch (operation.type) {
      case 'text_edit':
        return (
          <TextPreview
            before={operation.data.before.text}
            after={operation.data.after.text}
          />
        );
      case 'layer_transform':
        return (
          <TransformPreview
            before={operation.data.before.transform}
            after={operation.data.after.transform}
          />
        );
      // ... 其他预览类型
    }
  };

  return (
    <View style={styles.previewContainer}>
      <Text style={styles.operationType}>
        {getOperationTypeName(operation.type)}
      </Text>
      <Text style={styles.layerName}>{layer?.name}</Text>
      <View style={styles.previewContent}>{renderPreview()}</View>
    </View>
  );
};
```

## 5. 系统优势

1. **完整的操作记录**

   - 支持所有图层操作
   - 精确的状态恢复
   - 操作依赖管理
   - 快照系统支持

2. **优秀的性能**

   - 智能内存管理
   - 操作合并优化
   - 快照优化
   - 选择性记录

3. **可靠的状态管理**

   - 状态一致性保证
   - 依赖关系处理
   - 错误恢复机制
   - 状态验证

4. **良好的扩展性**
   - 支持新操作类型
   - 自定义合并策略
   - 灵活的快照系统
   - 可配置的优化策略

## 6. 注意事项

1. **内存管理**

   - 控制历史记录大小
   - 优化快照存储
   - 及时清理无用数据
   - 防止内存泄漏

2. **性能优化**

   - 合理使用快照
   - 优化操作合并
   - 控制重绘范围
   - 异步处理大操作

3. **状态一致性**

   - 验证操作有效性
   - 处理依赖关系
   - 保证状态同步
   - 处理冲突操作

4. **用户体验**
   - 即时的操作反馈
   - 清晰的历史记录
   - 预览功能支持
   - 性能无感知
