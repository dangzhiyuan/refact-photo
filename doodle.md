# PhotoPixel 涂鸦功能移植计划

## 项目背景

从 PhotoPixel 项目移植涂鸦功能到 refact-photo 项目。涂鸦功能包括多种画笔效果、手势操作、状态管理等。

## 技术栈对比

### PhotoPixel
```json
{
  "@shopify/react-native-skia": "^0.1.x",
  "react-native-reanimated": "^2.x",
  "react-native-gesture-handler": "^2.x"
}
```

### refact-photo
```json
{
  "@shopify/react-native-skia": "1.5.0",
  "react-native-gesture-handler": "^2.20.2",
  "react-native-reanimated": "^3.16.7",
  "zustand": "^5.0.3"
}
```

## 开发计划

### 1. 基础结构搭建

#### 1.1 目录结构
```
app/features/doodle/
├── components/
│   ├── DoodleCanvas.tsx      // 涂鸦画布
│   ├── DoodlePaintKits.tsx   // 工具栏
│   └── DoodleControls.tsx    // 控制面板
├── brushes/
│   ├── NormalBrush.tsx       // 普通画笔
│   ├── BlackBorderBrush.tsx  // 黑边画笔
│   ├── WhiteBodyBrush.tsx    // 白色画笔
│   ├── SparklerBrush.tsx     // 仙女棒
│   └── ColorBarBrush.tsx     // 彩色条
├── store/
│   └── useDoodleStore.ts     // 涂鸦状态管理
└── types/
    └── doodle.ts             // 类型定义
```

#### 1.2 类型定义
```typescript
// app/features/doodle/types/doodle.ts

export enum DoodleBrushType {
  Normal = 'normal',
  BlackBorder = 'black_border',
  WhiteBody = 'white_body',
  Sparkler = 'sparkler',
  ColorBar = 'color_bar'
}

export interface DoodlePath {
  id: string;
  path: SkPath;
  color: string;
  strokeWidth: number;
  brushType: DoodleBrushType;
  blendMode: SkBlendMode;
}

export interface DoodleState {
  paths: DoodlePath[];
  currentBrush: DoodleBrushType;
  strokeWidth: number;
  color: string;
  isErasing: boolean;
}
```

### 2. 状态管理实现

```typescript
// app/features/doodle/store/useDoodleStore.ts

import { create } from 'zustand';
import { DoodleState, DoodlePath, DoodleBrushType } from '../types/doodle';

export const useDoodleStore = create<DoodleState>((set, get) => ({
  paths: [],
  currentBrush: DoodleBrushType.Normal,
  strokeWidth: 5,
  color: '#000000',
  isErasing: false,

  // 添加路径
  addPath: (path: DoodlePath) => 
    set(state => ({ paths: [...state.paths, path] })),

  // 撤销
  undo: () => 
    set(state => ({ paths: state.paths.slice(0, -1) })),

  // 清空
  clear: () => 
    set({ paths: [] }),

  // 设置画笔类型
  setBrushType: (type: DoodleBrushType) => 
    set({ currentBrush: type }),

  // 设置画笔宽度
  setStrokeWidth: (width: number) => 
    set({ strokeWidth: width }),

  // 设置颜色
  setColor: (color: string) => 
    set({ color }),

  // 切换橡皮擦
  toggleEraser: () => 
    set(state => ({ isErasing: !state.isErasing }))
}));
```

### 3. 手势系统适配

#### 3.1 手势系统架构
```typescript
// app/hooks/canvas/useCanvasGestures.ts

interface UseCanvasGesturesProps {
  enabled: boolean;
  mode: 'transform' | 'draw';  // 新增模式控制
  onTransformEnd: (transform: Transform) => void;
  onDrawStart?: () => void;
  onDrawUpdate?: (point: { x: number; y: number }) => void;
  onDrawEnd?: () => void;
}

export const useCanvasGestures = ({
  enabled,
  mode,
  onTransformEnd,
  onDrawStart,
  onDrawUpdate,
  onDrawEnd,
}: UseCanvasGesturesProps) => {
  // 共享值
  const scale = useSharedValue(1);
  const offset = useSharedValue({ x: 0, y: 0 });
  const isActive = useSharedValue(false);

  // 涂鸦手势
  const drawGesture = Gesture.Pan()
    .enabled(enabled && mode === 'draw')
    .onStart((e) => {
      "worklet";
      if (onDrawStart) {
        runOnJS(onDrawStart)();
      }
    })
    .onUpdate((e) => {
      "worklet";
      if (onDrawUpdate) {
        // 转换坐标到画布空间
        const point = {
          x: (e.absoluteX - offset.value.x) / scale.value,
          y: (e.absoluteY - offset.value.y) / scale.value,
        };
        runOnJS(onDrawUpdate)(point);
      }
    })
    .onEnd(() => {
      "worklet";
      if (onDrawEnd) {
        runOnJS(onDrawEnd)();
      }
    });

  // 变换手势
  const transformGesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture
  ).enabled(enabled && mode === 'transform');

  // 根据模式选择手势
  const gesture = Gesture.Exclusive(
    drawGesture,
    transformGesture
  );

  return {
    gesture,
    scale,
    offset,
    isActive,
  };
};
```

#### 3.2 工具状态管理
```typescript
// app/store/useToolStore.ts

interface ToolState {
  currentTool: 'select' | 'draw' | 'text' | 'shape';
  setCurrentTool: (tool: ToolState['currentTool']) => void;
}

const useToolStore = create<ToolState>((set) => ({
  currentTool: 'select',
  setCurrentTool: (tool) => set({ currentTool: tool }),
}));
```

#### 3.3 画布组件集成
```typescript
// app/features/canvas/CanvasView.tsx

export const CanvasView: FC = () => {
  const { selectedLayerId, updateLayer } = useLayerStore();
  const { currentTool } = useToolStore();
  const { currentPath, addPath } = useDoodleStore();

  const { gesture, scale, offset, isActive } = useCanvasGestures({
    enabled: true,
    mode: currentTool === 'draw' ? 'draw' : 'transform',
    onTransformEnd: (transform) => {
      if (selectedLayerId) {
        updateLayer(selectedLayerId, { transform });
      }
    },
    onDrawStart: () => {
      currentPath.value = Skia.Path.Make();
      currentPath.value.moveTo(e.x, e.y);
    },
    onDrawUpdate: (point) => {
      if (currentPath.value) {
        currentPath.value.lineTo(point.x, point.y);
      }
    },
    onDrawEnd: () => {
      if (currentPath.value) {
        addPath({
          id: Date.now().toString(),
          path: currentPath.value,
          color,
          strokeWidth,
          brushType: currentBrush,
          blendMode: isErasing ? 'clear' : 'srcOver'
        });
        currentPath.value = null;
      }
    },
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.gestureContainer, animatedStyle]}>
          <Canvas style={styles.canvas}>
            <LayerRenderer />
            {currentTool === 'draw' && <DoodleCanvas />}
          </Canvas>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
```

### 4. 画布组件实现

```typescript
// app/features/doodle/components/DoodleCanvas.tsx

import { Canvas, Path, Group } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue } from 'react-native-reanimated';

export const DoodleCanvas: FC<{
  width: number;
  height: number;
}> = ({ width, height }) => {
  const currentPath = useSharedValue<SkPath | null>(null);
  const { paths, addPath, currentBrush, strokeWidth, color, isErasing } = useDoodleStore();

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      currentPath.value = Skia.Path.Make();
      currentPath.value.moveTo(e.x, e.y);
    })
    .onUpdate((e) => {
      if (currentPath.value) {
        currentPath.value.lineTo(e.x, e.y);
      }
    })
    .onEnd(() => {
      if (currentPath.value) {
        addPath({
          id: Date.now().toString(),
          path: currentPath.value,
          color,
          strokeWidth,
          brushType: currentBrush,
          blendMode: isErasing ? 'clear' : 'srcOver'
        });
        currentPath.value = null;
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Canvas style={{ width, height }}>
        <Group>
          {paths.map((path) => (
            <PathRenderer key={path.id} {...path} />
          ))}
          {currentPath.value && (
            <Path
              path={currentPath.value}
              color={color}
              style="stroke"
              strokeWidth={strokeWidth}
            />
          )}
        </Group>
      </Canvas>
    </GestureDetector>
  );
};
```

### 5. 画笔系统实现

```typescript
// app/features/doodle/brushes/NormalBrush.tsx

export const NormalBrush: FC<{
  path: SkPath;
  color: string;
  strokeWidth: number;
}> = ({ path, color, strokeWidth }) => {
  return (
    <Path
      path={path}
      color={color}
      style="stroke"
      strokeWidth={strokeWidth}
      strokeCap="round"
      strokeJoin="round"
    />
  );
};

// 其他画笔实现类似，根据效果调整参数
```

### 6. 工具栏实现

```typescript
// app/features/doodle/components/DoodlePaintKits.tsx

export const DoodlePaintKits: FC = () => {
  const {
    currentBrush,
    strokeWidth,
    color,
    isErasing,
    setBrushType,
    setStrokeWidth,
    setColor,
    toggleEraser,
    undo,
    clear
  } = useDoodleStore();

  return (
    <View style={styles.container}>
      <BrushSelector
        currentBrush={currentBrush}
        onSelect={setBrushType}
      />
      <ColorPicker
        color={color}
        onColorChange={setColor}
      />
      <Slider
        value={strokeWidth}
        onValueChange={setStrokeWidth}
        minimum={1}
        maximum={50}
      />
      <TouchableOpacity onPress={toggleEraser}>
        <Icon name="eraser" color={isErasing ? 'blue' : 'black'} />
      </TouchableOpacity>
      <TouchableOpacity onPress={undo}>
        <Icon name="undo" />
      </TouchableOpacity>
      <TouchableOpacity onPress={clear}>
        <Icon name="trash" />
      </TouchableOpacity>
    </View>
  );
};
```

### 7. 集成到主画布

```typescript
// app/features/canvas/CanvasView.tsx

export const CanvasView: FC = () => {
  const { isDoodleMode } = useToolStore();
  const dimensions = useMemo(() => getCanvasDimensions(), []);

  return (
    <View style={styles.container}>
      {/* 现有画布层 */}
      <ExistingCanvas />
      
      {/* 涂鸦层 */}
      {isDoodleMode && (
        <DoodleCanvas
          width={dimensions.width}
          height={dimensions.height}
        />
      )}
      
      {/* 工具栏 */}
      {isDoodleMode && <DoodlePaintKits />}
    </View>
  );
};
```

## 实现步骤

1. **基础设置**
   - 创建目录结构
   - 添加类型定义
   - 设置状态管理

2. **手势系统适配**
   - 实现模式切换
   - 添加坐标转换
   - 处理手势冲突

3. **核心功能**
   - 实现基础画布
   - 添加手势控制
   - 实现路径渲染

4. **画笔系统**
   - 实现各种画笔效果
   - 添加画笔切换功能
   - 实现橡皮擦

5. **工具栏**
   - 实现颜色选择器
   - 添加画笔大小控制
   - 实现撤销/重做

6. **优化和测试**
   - 性能优化
   - 内存管理
   - 功能测试

## 注意事项

1. **性能优化**
   - 使用 worklet 优化手势性能
   - 避免不必要的重渲染
   - 优化坐标转换计算

2. **手势处理**
   - 确保手势模式正确切换
   - 处理好坐标系转换
   - 避免手势冲突

3. **内存管理**
   - 及时清理不需要的路径
   - 控制历史记录大小
   - 优化图层渲染

4. **兼容性**
   - 确保与现有功能兼容
   - 处理各种边界情况
   - 保持代码风格一致

## 后续优化

1. 添加更多画笔效果
2. 优化性能
3. 增加更多交互功能
4. 完善错误处理
5. 添加单元测试

## 参考资源

1. PhotoPixel 项目涂鸦实现
2. Skia 文档
3. React Native Gesture Handler 文档
4. Reanimated 文档