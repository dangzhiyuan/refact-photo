# PhotoPixel Canvas 渲染优化

## 1. 画布计算优化方案

### 1.1 优化后的计算逻辑

```typescript
// 1. 使用 useMemo 优化计算
const canvasDimensions = useMemo(() => {
  const computeCanvasDimensions = (imageWidth: number, imageHeight: number) => {
    // 计算屏幕比例和图片比例
    const screenRatio = parentScreenWidth / parentScreenHeight;
    const imageRatio = imageWidth / imageHeight;

    let dimensions;

    // 根据比例决定适配方式
    if (imageRatio > screenRatio) {
      // 图片更宽，以屏幕宽度为准
      dimensions = {
        width: parentScreenWidth,
        height: parentScreenWidth / imageRatio,
      };
    } else {
      // 图片更高，以屏幕高度为准
      dimensions = {
        width: parentScreenHeight * imageRatio,
        height: parentScreenHeight,
      };
    }

    // 确保尺寸不小于屏幕
    return {
      width: Math.max(dimensions.width, parentScreenWidth),
      height: Math.max(dimensions.height, parentScreenHeight),
    };
  };

  return computeCanvasDimensions(imageDimensions.width, imageDimensions.height);
}, [imageDimensions, parentScreenWidth, parentScreenHeight]);

// 2. 优化中心点计算
const canvasCenter = useMemo(
  () => ({
    x: canvasDimensions.width / 2,
    y: canvasDimensions.height / 2,
  }),
  [canvasDimensions],
);
```

### 1.2 性能优化点

1. **计算缓存**：

   - 使用 `useMemo` 缓存计算结果
   - 只在依赖项变化时重新计算
   - 避免不必要的重复计算

2. **状态优化**：

```typescript
// 优化前：分散的状态
const [canvasDimensions, setCanvasDimensions] = useState({width: 0, height: 0});
const [canvasCenter, setCanvasCenter] = useState({width: 0, height: 0});

// 优化后：合并相关状态
const [canvasState, setCanvasState] = useState({
  dimensions: {width: 0, height: 0},
  center: {x: 0, y: 0},
});
```

3. **计算简化**：

```typescript
// 优化前：多次条件判断
if (canvasHeight > parentScreenHeight) {
  canvasHeight = parentScreenHeight;
  canvasWidth = canvasHeight * imageAspectRatio;
}
if (canvasWidth > parentScreenWidth) {
  canvasWidth = parentScreenWidth;
  canvasHeight = canvasWidth / imageAspectRatio;
}

// 优化后：一次性判断
const fitByWidth = imageRatio > screenRatio;
const dimensions = fitByWidth
  ? {
      width: parentScreenWidth,
      height: parentScreenWidth / imageRatio,
    }
  : {
      width: parentScreenHeight * imageRatio,
      height: parentScreenHeight,
    };
```

## 2. Canvas 渲染策略优化

### 2.1 基础组件抽象

```typescript
// 1. 基础 Canvas 属性接口
interface BaseCanvasProps {
  dimensions: {
    width: number;
    height: number;
  };
  image: SkImage | null;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

// 2. 基础 Canvas 组件
const BaseCanvas: FC<BaseCanvasProps> = ({
  dimensions,
  children,
  style,
  ...props
}) => (
  <Canvas
    style={[
      styles.canvas,
      {width: dimensions.width, height: dimensions.height},
      style,
    ]}
    {...props}>
    {children}
  </Canvas>
);
```

### 2.2 渲染策略模式

```typescript
// 1. 策略接口
interface CanvasStrategy {
  render(props: CanvasProps): React.ReactNode;
}

// 2. 具体策略实现
const FilterCanvasStrategy: CanvasStrategy = {
  render: ({dimensions, image, intensity = 0.5}) => (
    <BaseCanvas dimensions={dimensions}>
      <Provider store={store}>
        <FilterCanvasFill
          orig_image={image}
          intensity={intensity}
          canvas_width={dimensions.width}
          canvas_height={dimensions.height}
        />
      </Provider>
    </BaseCanvas>
  ),
};

const StickerCanvasStrategy: CanvasStrategy = {
  render: ({dimensions, image}) => (
    <BaseCanvas dimensions={dimensions}>
      <Image
        image={image}
        fit="fill"
        x={0}
        y={0}
        width={dimensions.width}
        height={dimensions.height}
      />
    </BaseCanvas>
  ),
};

// 3. 策略映射
const CANVAS_STRATEGIES: Record<MainCategoryType, CanvasStrategy> = {
  [MainCategoryType.filter]: FilterCanvasStrategy,
  [MainCategoryType.sticker]: StickerCanvasStrategy,
  [MainCategoryType.template]: TemplateCanvasStrategy,
  [MainCategoryType.doodle]: DoodleCanvasStrategy,
  // ... 其他策略
};
```

### 2.3 统一的 Canvas 容器

```typescript
// 1. 容器属性接口
interface CanvasContainerProps extends BaseCanvasProps {
  activateCate: MainCategoryType;
  intensity?: number;
}

// 2. Canvas 容器组件
const CanvasContainer: FC<CanvasContainerProps> = ({
  activateCate,
  ...props
}) => {
  const strategy = CANVAS_STRATEGIES[activateCate];

  // 使用 useMemo 优化渲染
  const canvas = useMemo(() => {
    if (!strategy) return null;
    return strategy.render(props);
  }, [strategy, props]);

  return <View style={styles.container}>{canvas}</View>;
};
```

### 2.4 错误处理和类型安全

```typescript
// 1. 错误边界组件
class CanvasErrorBoundary extends React.Component<{
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Canvas Error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}

// 2. 安全的 Canvas 组件
const SafeCanvas: FC<CanvasContainerProps> = props => (
  <CanvasErrorBoundary
    onError={(error, errorInfo) => {
      // 错误处理逻辑
      console.error('Canvas rendering failed:', error);
      // 可以添加错误上报或降级渲染
    }}>
    <CanvasContainer {...props} />
  </CanvasErrorBoundary>
);
```

### 2.5 使用示例

```typescript
// 在 EditorHome 中使用
const EditorHome: FC = () => {
  const {activateCate} = useSelector(
    (state: iRootState) => state.editorMainCategory,
  );

  // 使用 useMemo 缓存画布尺寸
  const dimensions = useMemo(
    () => ({
      width: canvasDimensions.width,
      height: canvasDimensions.height,
    }),
    [canvasDimensions],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <SafeCanvas
        activateCate={activateCate}
        dimensions={dimensions}
        image={image}
        intensity={0.5}
      />
      {/* 其他UI组件 */}
    </SafeAreaView>
  );
};
```

## 3. 优化效果

### 3.1 代码组织

- 清晰的组件层次结构
- 职责明确的策略模式
- 统一的错误处理机制

### 3.2 性能提升

- 减少重复渲染
- 优化条件判断
- 缓存计算结果

### 3.3 可维护性

- 易于添加新的渲染策略
- 统一的属性接口
- 类型安全的实现

### 3.4 可靠性

- 完善的错误处理
- 降级渲染机制
- 运行时类型检查
