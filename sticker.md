# PhotoPixel 贴纸功能移植详细计划

## 1. 功能概述

### 1.1 现有功能分析
PhotoPixel 的贴纸系统包含以下核心功能：
- SVG 贴纸渲染
- 手势交互（拖拽、缩放、旋转）
- 贴纸选择和管理
- 贴纸变换框架
- 贴纸列表展示

### 1.2 技术栈对比
```typescript
// PhotoPixel
{
  "@shopify/react-native-skia": "^0.1.x",
  "react-native-reanimated": "^2.x",
  "react-native-gesture-handler": "^2.x",
  "redux": "^4.x"
}

// refact-photo
{
  "@shopify/react-native-skia": "1.5.0",
  "react-native-gesture-handler": "^2.20.2",
  "react-native-reanimated": "^3.16.7",
  "zustand": "^5.0.3"
}
```

## 2. 架构设计

### 2.1 目录结构
```
app/features/sticker/
├── components/
│   ├── StickerCanvas.tsx     // 贴纸画布
│   ├── StickerList.tsx       // 贴纸列表
│   ├── StickerFrame.tsx      // 贴纸变换框架
│   ├── StickerControls.tsx   // 贴纸控制器
│   └── StickerPreview.tsx    // 贴纸预览
├── gestures/
│   ├── useStickerGesture.ts  // 贴纸手势钩子
│   └── useTransformGesture.ts // 变换手势钩子
├── store/
│   ├── useStickerStore.ts    // 贴纸状态管理
│   └── useStickerCache.ts    // 资源缓存管理
├── hooks/
│   ├── useStickerEffect.ts   // 贴纸效果钩子
│   └── useStickerMatrix.ts   // 矩阵变换钩子
└── types/
    ├── sticker.ts            // 基础类型定义
    └── transform.ts          // 变换类型定义
```

### 2.2 核心类型定义
```typescript
// types/sticker.ts

export interface StickerAsset {
  id: string;
  type: 'svg' | 'image';
  source: string;
  thumbnail: string;
  category: string;
  width: number;
  height: number;
}

export interface StickerTransform {
  matrix: SkMatrix;
  scale: number;
  rotation: number;
  position: { x: number; y: number };
}

export interface StickerInstance {
  id: string;
  asset: StickerAsset;
  transform: StickerTransform;
  isSelected: boolean;
}

export interface StickerState {
  stickers: StickerInstance[];
  selectedStickerId: string | null;
  assets: StickerAsset[];
}
```

### 2.3 状态管理
```typescript
// store/useStickerStore.ts

interface StickerStore extends StickerState {
  // 贴纸管理
  addSticker: (asset: StickerAsset) => void;
  removeSticker: (id: string) => void;
  selectSticker: (id: string | null) => void;
  
  // 变换管理
  updateTransform: (id: string, transform: Partial<StickerTransform>) => void;
  resetTransform: (id: string) => void;
  
  // 资源管理
  loadAssets: (assets: StickerAsset[]) => void;
  clearStickers: () => void;
}

export const useStickerStore = create<StickerStore>((set, get) => ({
  // ... 状态初始化
  // ... 方法实现
}));
```

## 3. 核心组件实现

### 3.1 贴纸画布
```typescript
// components/StickerCanvas.tsx

export const StickerCanvas: FC<{
  width: number;
  height: number;
}> = ({ width, height }) => {
  const { stickers, selectedStickerId } = useStickerStore();
  
  return (
    <Canvas style={{ width, height }}>
      <Group>
        {stickers.map((sticker) => (
          <StickerRenderer
            key={sticker.id}
            sticker={sticker}
            isSelected={sticker.id === selectedStickerId}
          />
        ))}
      </Group>
    </Canvas>
  );
};
```

### 3.2 贴纸手势处理
```typescript
// gestures/useStickerGesture.ts

export const useStickerGesture = (
  transform: SharedValue<StickerTransform>,
  onTransformEnd?: (transform: StickerTransform) => void
) => {
  const offset = useSharedValue({ x: 0, y: 0 });
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      offset.value = transform.value.position;
    })
    .onUpdate((e) => {
      transform.value = {
        ...transform.value,
        position: {
          x: offset.value.x + e.translationX,
          y: offset.value.y + e.translationY,
        },
      };
    })
    .onEnd(() => {
      onTransformEnd?.(transform.value);
    });

  const pinchGesture = Gesture.Pinch()
    // ... 实现缩放逻辑

  const rotateGesture = Gesture.Rotation()
    // ... 实现旋转逻辑

  return Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    rotateGesture
  );
};
```

### 3.3 贴纸渲染器
```typescript
// components/StickerRenderer.tsx

export const StickerRenderer: FC<{
  sticker: StickerInstance;
  isSelected: boolean;
}> = ({ sticker, isSelected }) => {
  const { matrix, updateTransform } = useStickerMatrix(sticker.transform);
  const gesture = useStickerGesture(matrix, updateTransform);

  return (
    <GestureDetector gesture={gesture}>
      <Group transform={matrix.value}>
        {sticker.asset.type === 'svg' ? (
          <SvgSticker source={sticker.asset.source} />
        ) : (
          <ImageSticker source={sticker.asset.source} />
        )}
        {isSelected && <StickerFrame size={sticker.asset} />}
      </Group>
    </GestureDetector>
  );
};
```

## 4. 性能优化

### 4.1 渲染优化
- 使用 `useMemo` 缓存贴纸渲染结果
- 实现贴纸资源预加载
- 优化贴纸变换计算

```typescript
const renderedSticker = useMemo(() => (
  <StickerRenderer sticker={sticker} isSelected={isSelected} />
), [sticker, isSelected]);
```

### 4.2 手势优化
- 使用 worklet 优化手势计算
- 实现手势防抖
- 优化变换矩阵计算

```typescript
const gesture = Gesture.Pan()
  .worklet()
  .onUpdate((e) => {
    "worklet";
    // 手势处理逻辑
  });
```

### 4.3 内存优化
- 实现贴纸资源缓存
- 自动清理未使用资源
- 控制贴纸数量上限

## 5. 注意事项

### 5.1 手势处理
- 处理手势冲突
- 优化手势响应
- 处理边界情况

### 5.2 资源管理
- SVG 资源加载和缓存
- 内存使用监控
- 资源释放策略

### 5.3 兼容性
- 处理不同设备差异
- 适配不同屏幕尺寸
- 处理性能差异

## 6. 后续优化

1. **功能增强**
   - 添加更多贴纸特效
   - 支持贴纸组合
   - 实现贴纸层级管理

2. **性能优化**
   - 优化渲染性能
   - 改进手势响应
   - 优化内存使用

3. **用户体验**
   - 改进贴纸选择界面
   - 添加贴纸预览
   - 优化编辑体验

## 7. 开发计划

### 第一阶段：基础框架
- [ ] 搭建目录结构
- [ ] 实现核心类型定义
- [ ] 设置状态管理系统

### 第二阶段：核心功能
- [ ] 实现贴纸渲染
- [ ] 添加手势控制
- [ ] 实现变换框架

### 第三阶段：UI 实现
- [ ] 开发贴纸列表
- [ ] 实现贴纸预览
- [ ] 添加编辑控件

### 第四阶段：优化和测试
- [ ] 性能优化
- [ ] 手势优化
- [ ] 单元测试

## 8. 参考资源

1. PhotoPixel 项目贴纸实现
2. Skia SVG 渲染文档
3. React Native Gesture Handler 文档
4. Reanimated 动画指南 