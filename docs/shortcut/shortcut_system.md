# PhotoPixel 快捷键系统实现文档

## 1. 系统架构

### 1.1 核心功能模块

- 快捷键管理：管理所有快捷键的注册和解绑
- 快捷键执行：处理快捷键的触发和执行
- 快捷键配置：支持自定义快捷键设置
- 上下文管理：处理不同上下文的快捷键

### 1.2 基础数据结构

```typescript
// 快捷键定义
interface Shortcut {
  id: string;
  keys: string[]; // 组合键数组，如 ['Ctrl', 'C']
  command: string;
  context?: string; // 快捷键生效的上下文
  description: string;
  isEnabled: boolean;
  priority: number; // 优先级，处理快捷键冲突
}

// 快捷键配置
interface ShortcutConfig {
  shortcuts: Map<string, Shortcut>;
  customizations: Map<string, string[]>; // 用户自定义的快捷键映射
  contexts: Set<string>; // 当前活动的上下文
}

// 按键组合
interface KeyCombination {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

// 命令定义
interface Command {
  id: string;
  execute: () => void;
  undo?: () => void;
  isEnabled?: () => boolean;
  label: string;
  icon?: string;
}
```

## 2. 核心功能实现

### 2.1 快捷键管理器

```typescript
class ShortcutManager {
  private config: ShortcutConfig;
  private commandRegistry: Map<string, Command>;
  private activeShortcuts: Set<string>;
  private keyState: Map<string, boolean>;

  constructor() {
    this.config = {
      shortcuts: new Map(),
      customizations: new Map(),
      contexts: new Set(),
    };
    this.commandRegistry = new Map();
    this.activeShortcuts = new Set();
    this.keyState = new Map();

    // 初始化默认快捷键
    this.initializeDefaultShortcuts();
    // 加载用户自定义快捷键
    this.loadCustomShortcuts();
  }

  // 注册快捷键
  registerShortcut(shortcut: Shortcut): void {
    // 检查快捷键冲突
    if (this.hasConflict(shortcut)) {
      this.resolveConflict(shortcut);
    }

    this.config.shortcuts.set(shortcut.id, shortcut);
    this.updateActiveShortcuts();
  }

  // 注册命令
  registerCommand(command: Command): void {
    this.commandRegistry.set(command.id, command);
  }

  // 处理按键事件
  handleKeyEvent(event: KeyboardEvent): void {
    // 更新按键状态
    this.updateKeyState(event);

    // 检查是否匹配任何快捷键
    const matchedShortcut = this.findMatchingShortcut();
    if (matchedShortcut) {
      this.executeShortcut(matchedShortcut);
    }
  }

  // 检查快捷键冲突
  private hasConflict(shortcut: Shortcut): boolean {
    for (const existing of this.config.shortcuts.values()) {
      if (
        this.areKeysEqual(existing.keys, shortcut.keys) &&
        existing.context === shortcut.context
      ) {
        return true;
      }
    }
    return false;
  }

  // 解决快捷键冲突
  private resolveConflict(shortcut: Shortcut): void {
    const conflicts = Array.from(this.config.shortcuts.values()).filter(
      existing =>
        this.areKeysEqual(existing.keys, shortcut.keys) &&
        existing.context === shortcut.context,
    );

    // 根据优先级保留优先级最高的快捷键
    conflicts.sort((a, b) => b.priority - a.priority);
    const winner = conflicts[0];

    if (shortcut.priority > winner.priority) {
      // 禁用冲突的快捷键
      conflicts.forEach(conflict => {
        conflict.isEnabled = false;
      });
    } else {
      shortcut.isEnabled = false;
    }
  }

  // 执行快捷键命令
  private executeShortcut(shortcut: Shortcut): void {
    const command = this.commandRegistry.get(shortcut.command);
    if (!command) return;

    if (command.isEnabled?.() ?? true) {
      command.execute();
      // 记录到历史记录
      this.recordToHistory(shortcut, command);
    }
  }
}
```

### 2.2 上下文管理器

```typescript
class ShortcutContextManager {
  private activeContexts: Set<string> = new Set();
  private contextHierarchy: Map<string, string[]> = new Map();

  // 激活上下文
  activateContext(context: string): void {
    this.activeContexts.add(context);
    // 激活父级上下文
    const parents = this.contextHierarchy.get(context);
    if (parents) {
      parents.forEach(parent => this.activeContexts.add(parent));
    }
  }

  // 停用上下文
  deactivateContext(context: string): void {
    this.activeContexts.delete(context);
    // 停用子级上下文
    this.getChildContexts(context).forEach(child => {
      this.activeContexts.delete(child);
    });
  }

  // 检查快捷键是否在当前上下文中可用
  isShortcutAvailable(shortcut: Shortcut): boolean {
    if (!shortcut.context) return true;
    return this.activeContexts.has(shortcut.context);
  }

  // 获取子级上下文
  private getChildContexts(context: string): string[] {
    return Array.from(this.contextHierarchy.entries())
      .filter(([, parents]) => parents.includes(context))
      .map(([child]) => child);
  }
}
```

### 2.3 快捷键配置管理器

```typescript
class ShortcutConfigManager {
  private readonly CONFIG_KEY = 'photopixel_shortcuts';

  // 保存快捷键配置
  saveConfig(config: ShortcutConfig): void {
    const serializedConfig = this.serializeConfig(config);
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(serializedConfig));
  }

  // 加载快捷键配置
  loadConfig(): ShortcutConfig {
    const savedConfig = localStorage.getItem(this.CONFIG_KEY);
    if (!savedConfig) return this.getDefaultConfig();

    try {
      const parsedConfig = JSON.parse(savedConfig);
      return this.deserializeConfig(parsedConfig);
    } catch (error) {
      console.error('Failed to load shortcut config:', error);
      return this.getDefaultConfig();
    }
  }

  // 重置为默认配置
  resetToDefault(): ShortcutConfig {
    const defaultConfig = this.getDefaultConfig();
    this.saveConfig(defaultConfig);
    return defaultConfig;
  }

  // 获取默认配置
  private getDefaultConfig(): ShortcutConfig {
    return {
      shortcuts: new Map([
        // 文件操作
        [
          'file.new',
          {
            id: 'file.new',
            keys: ['Ctrl', 'N'],
            command: 'newFile',
            description: '新建文件',
            isEnabled: true,
            priority: 1,
          },
        ],
        [
          'file.save',
          {
            id: 'file.save',
            keys: ['Ctrl', 'S'],
            command: 'saveFile',
            description: '保存文件',
            isEnabled: true,
            priority: 1,
          },
        ],
        // 编辑操作
        [
          'edit.undo',
          {
            id: 'edit.undo',
            keys: ['Ctrl', 'Z'],
            command: 'undo',
            description: '撤销',
            isEnabled: true,
            priority: 1,
          },
        ],
        [
          'edit.redo',
          {
            id: 'edit.redo',
            keys: ['Ctrl', 'Shift', 'Z'],
            command: 'redo',
            description: '重做',
            isEnabled: true,
            priority: 1,
          },
        ],
        // 图层操作
        [
          'layer.new',
          {
            id: 'layer.new',
            keys: ['Ctrl', 'Shift', 'N'],
            command: 'newLayer',
            description: '新建图层',
            isEnabled: true,
            priority: 1,
          },
        ],
        [
          'layer.delete',
          {
            id: 'layer.delete',
            keys: ['Delete'],
            command: 'deleteLayer',
            description: '删除图层',
            isEnabled: true,
            priority: 1,
          },
        ],
      ]),
      customizations: new Map(),
      contexts: new Set(['global']),
    };
  }
}
```

## 3. 性能优化

### 3.1 事件优化

```typescript
class ShortcutEventOptimizer {
  private lastEventTime: number = 0;
  private readonly THROTTLE_TIME = 16; // ~60fps

  // 节流处理
  throttleKeyEvent(
    event: KeyboardEvent,
    handler: (event: KeyboardEvent) => void,
  ): void {
    const now = Date.now();
    if (now - this.lastEventTime >= this.THROTTLE_TIME) {
      handler(event);
      this.lastEventTime = now;
    }
  }

  // 批量处理
  batchProcessEvents(
    events: KeyboardEvent[],
    handler: (events: KeyboardEvent[]) => void,
  ): void {
    requestAnimationFrame(() => {
      handler(events);
    });
  }
}
```

### 3.2 内存优化

```typescript
class ShortcutMemoryOptimizer {
  private readonly MAX_HISTORY = 1000;
  private eventHistory: KeyboardEvent[] = [];

  // 管理事件历史
  addToHistory(event: KeyboardEvent): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.MAX_HISTORY) {
      this.eventHistory.shift();
    }
  }

  // 清理未使用的快捷键
  cleanupUnusedShortcuts(config: ShortcutConfig): void {
    const usedCommands = new Set<string>();
    this.eventHistory.forEach(event => {
      config.shortcuts.forEach(shortcut => {
        if (this.matchesShortcut(event, shortcut)) {
          usedCommands.add(shortcut.command);
        }
      });
    });

    // 禁用长期未使用的快捷键
    config.shortcuts.forEach(shortcut => {
      if (!usedCommands.has(shortcut.command)) {
        shortcut.isEnabled = false;
      }
    });
  }
}
```

## 4. 用户界面集成

### 4.1 快捷键设置面板

```typescript
const ShortcutSettingsPanel: FC = () => {
  const [shortcuts, setShortcuts] = useState<Map<string, Shortcut>>(new Map());
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.shortcutList}>
        {Array.from(shortcuts.values()).map(shortcut => (
          <ShortcutItem
            key={shortcut.id}
            shortcut={shortcut}
            isEditing={editingId === shortcut.id}
            onEdit={() => setEditingId(shortcut.id)}
            onSave={handleSave}
            onReset={handleReset}
          />
        ))}
      </ScrollView>

      <View style={styles.controls}>
        <Button title="重置所有" onPress={handleResetAll} />
        <Button title="导入配置" onPress={handleImport} />
        <Button title="导出配置" onPress={handleExport} />
      </View>
    </View>
  );
};
```

### 4.2 快捷键提示

```typescript
const ShortcutTooltip: FC<{command: string}> = ({command}) => {
  const shortcut = useShortcut(command);

  if (!shortcut) return null;

  return (
    <View style={styles.tooltip}>
      <Text style={styles.description}>{shortcut.description}</Text>
      <Text style={styles.keys}>{shortcut.keys.join(' + ')}</Text>
    </View>
  );
};
```

## 5. 系统优势

1. **完整的快捷键支持**

   - 支持所有常用操作
   - 多键组合支持
   - 上下文感知
   - 冲突处理

2. **灵活的配置**

   - 自定义快捷键
   - 配置导入导出
   - 默认配置管理
   - 实时生效

3. **优秀的性能**

   - 事件优化
   - 内存管理
   - 快速响应
   - 低资源占用

4. **良好的用户体验**
   - 直观的设置界面
   - 实时提示
   - 错误处理
   - 配置持久化

## 6. 注意事项

1. **兼容性处理**

   - 跨平台支持
   - 浏览器差异
   - 键盘布局
   - 特殊键处理

2. **性能优化**

   - 事件节流
   - 内存管理
   - 配置缓存
   - 按需加载

3. **用户体验**

   - 清晰的提示
   - 易用的配置
   - 及时的反馈
   - 错误恢复

4. **安全性**
   - 快捷键验证
   - 配置保护
   - 权限控制
   - 数据备份
