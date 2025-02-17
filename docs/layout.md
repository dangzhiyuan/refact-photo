# PhotoPixel 自适应布局实现

## 1. 核心布局结构

```typescript
// EditorHome.tsx
import {
  SafeAreaView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

const EditorHome: FC = () => {
  // 1. 获取屏幕尺寸
  const windowHeight = useWindowDimensions().height;
  const windowWidth = useWindowDimensions().width;

  // 2. 定义布局比例常量
  const windhowsHeightRatio = 0.55; // EditorHome 视图占屏幕高度的 55%
  const scaleRatioHeight = 0.95; // EditorCanvas 占 EditorHome 高度的 95%
  const scaleRatioWeight = 0.85; // EditorCanvas 占屏幕宽度的 85%

  return (
    <SafeAreaView style={styles.safeAera}>
      {/* 顶部标题栏 */}
      <CanvasHeader headerName={activeCateName} />

      {/* 画布容器 */}
      <View
        style={[
          styles.container,
          {
            height: windowHeight * windhowsHeightRatio,
            width: '100%',
          },
        ]}>
        <EditorCanvas
          parentScreenHeight={
            windowHeight * windhowsHeightRatio * scaleRatioHeight
          }
          parentScreenWidth={windowWidth * scaleRatioWeight}
        />
      </View>

      {/* 绘画工具（条件渲染） */}
      {isUseDoodle && <DoodlePaintKits />}

      {/* 底部编辑区 */}
      <View style={styles.editorBox}>
        <View style={styles.catePanels}>
          <MainCategoryTabs onChange={srcollSwiper} />
        </View>
        <EditorPanels />
      </View>
    </SafeAreaView>
  );
};
```

## 2. 样式定义

```typescript
const styles = StyleSheet.create({
  // 安全区域样式
  safeAera: {
    backgroundColor: windowBk,
    flex: 1, // 占满整个安全区域
  },

  // 画布容器样式
  container: {
    backgroundColor: windowBk,
    justifyContent: 'center', // 垂直居中
    alignItems: 'center', // 水平居中
  },

  // 编辑区域样式
  editorBox: {
    backgroundColor: whiteBk,
    flex: 1,
    alignItems: 'flex-start', // 左对齐
  },

  // 分类面板样式
  catePanels: {
    height: operatorTabHeightLevelOne,
    flexDirection: 'column',
    backgroundColor: windowBk,
  },
});
```

## 3. 布局原理解析

### 3.1 垂直方向布局

1. **SafeAreaView**

   - 使用 `flex: 1` 占满整个安全区域
   - 确保内容不会被刘海屏、底部手势条等遮挡

2. **画布区域**

   - 高度使用屏幕高度的固定比例：`windowHeight * windhowsHeightRatio`
   - 内部画布再次缩放：`windowHeight * windhowsHeightRatio * scaleRatioHeight`

3. **底部编辑区**
   - 使用 `flex: 1` 自动占据剩余空间
   - 分类面板使用固定高度

### 3.2 水平方向布局

1. **画布宽度**

   - 使用屏幕宽度的固定比例：`windowWidth * scaleRatioWeight`
   - 保持居中对齐

2. **编辑区域**
   - 宽度占满：`width: '100%'`
   - 内容左对齐

## 4. 关键布局技巧

1. **比例计算**

   ```typescript
   // 屏幕尺寸获取
   const windowHeight = useWindowDimensions().height;
   const windowWidth = useWindowDimensions().width;

   // 比例定义
   const windhowsHeightRatio = 0.55;
   const scaleRatioHeight = 0.95;
   const scaleRatioWeight = 0.85;
   ```

2. **Flex 布局**

   ```typescript
   // 父容器
   safeAera: {
       flex: 1
   }

   // 子容器
   container: {
       justifyContent: 'center',
       alignItems: 'center'
   }
   ```

3. **条件渲染**
   ```typescript
   {
     isUseDoodle && <DoodlePaintKits />;
   }
   ```

## 5. 适配要点

1. **不同屏幕尺寸**

   - 使用 useWindowDimensions 动态获取屏幕尺寸
   - 使用比例而非固定尺寸

2. **安全区域**

   - 使用 SafeAreaView 自动处理各种设备的安全区域

3. **居中对齐**

   - 使用 flexbox 的 justifyContent 和 alignItems 实现居中

4. **动态高度**
   - 底部编辑区使用 flex: 1 自适应剩余空间

## 6. 画布尺寸计算系统

### 6.1 计算逻辑

```typescript
const computeAndSetCanvasDimensions = (width: number, height: number) => {
  // 1. 计算图片宽高比
  const imageAspectRatio = width / height;
  let canvasWidth = 0;
  let canvasHeight = 0;

  // 2. 初始宽度适配
  canvasWidth = width > parentScreenWidth ? parentScreenWidth : width;
  canvasHeight = canvasWidth / imageAspectRatio;

  // 3. 高度溢出检查
  if (canvasHeight > parentScreenHeight) {
    canvasHeight = parentScreenHeight;
    canvasWidth = canvasHeight * imageAspectRatio;
  }

  // 4. 宽度溢出检查
  if (canvasWidth > parentScreenWidth) {
    canvasWidth = parentScreenWidth;
    canvasHeight = canvasWidth / imageAspectRatio;
  }

  // 5. 最小尺寸保证
  if (canvasWidth < parentScreenWidth && canvasHeight < parentScreenHeight) {
    canvasWidth = parentScreenWidth;
    canvasHeight = parentScreenHeight;
  }

  // 6. 更新状态
  setCanvasDimensions({width: canvasWidth, height: canvasHeight});
  setCanvasCenter({width: canvasWidth / 2, height: canvasHeight / 2});
};
```

### 6.2 计算结果应用

计算出的画布尺寸在以下场景中使用：

1. **基础容器布局**

```typescript
<View style={[{
    width: canvasDimensions.width,
    height: canvasDimensions.height,
    justifyContent: 'center',
    alignItems: 'center',
}]}>
```

2. **图片渲染**

```typescript
<Canvas
  style={[
    styles.canvas,
    {
      width: canvasDimensions.width,
      height: canvasDimensions.height,
    },
  ]}>
  <Image
    image={image}
    fit="fill"
    width={canvasDimensions.width}
    height={canvasDimensions.height}
  />
</Canvas>
```

3. **特效画布**

```typescript
<FilterCanvasFill
  orig_image={image}
  canvas_width={canvasDimensions.width}
  canvas_height={canvasDimensions.height}
/>
```

4. **贴纸定位**

```typescript
<SvgStickerFrame
  canvas_width={canvasCenter.width}
  canvas_height={canvasCenter.height}
/>
```

### 6.3 尺寸计算示例

以下是两个典型场景的计算示例：

1. **宽图（1000x500）**：

- 原始尺寸：1000x500，比例 2:1
- 屏幕尺寸：360x640
- 计算结果：360x640（保持最小屏幕尺寸）
- 中心点：(180, 320)

2. **高图（500x1000）**：

- 原始尺寸：500x1000，比例 1:2
- 屏幕尺寸：360x640
- 计算结果：360x640（保持最小屏幕尺寸）
- 中心点：(180, 320)

### 6.4 设计考虑

1. **比例保持**：

   - 保持原始图片的宽高比
   - 避免图片变形

2. **显示完整**：

   - 确保图片完整显示在屏幕内
   - 防止内容溢出

3. **操作空间**：

   - 画布尺寸不小于屏幕尺寸
   - 确保有足够的编辑操作空间

4. **居中对齐**：
   - 计算画布中心点
   - 用于贴纸等元素的定位参考

## 7. 画布计算优化方案

### 7.1 优化后的计算逻辑

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

### 7.2 性能优化点

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

### 7.3 类型安全

```typescript
// 添加类型定义
interface CanvasDimensions {
  width: number;
  height: number;
}

interface CanvasState {
  dimensions: CanvasDimensions;
  center: {
    x: number;
    y: number;
  };
}

// 使用类型
const computeCanvasDimensions = (
  imageWidth: number,
  imageHeight: number,
): CanvasDimensions => {
  // 计算逻辑
};
```

### 7.4 错误处理

```typescript
const computeCanvasDimensions = (imageWidth: number, imageHeight: number) => {
  // 1. 输入验证
  if (imageWidth <= 0 || imageHeight <= 0) {
    console.warn('Invalid image dimensions');
    return {
      width: parentScreenWidth,
      height: parentScreenHeight,
    };
  }

  // 2. 异常处理
  try {
    const imageRatio = imageWidth / imageHeight;
    // ... 计算逻辑
  } catch (error) {
    console.error('Error computing canvas dimensions:', error);
    // 返回安全的默认值
    return {
      width: parentScreenWidth,
      height: parentScreenHeight,
    };
  }
};
```

### 7.5 性能监控

```typescript
// 添加性能监控
useEffect(() => {
  const startTime = performance.now();

  // 计算画布尺寸
  const dimensions = computeCanvasDimensions(
    imageDimensions.width,
    imageDimensions.height,
  );

  const endTime = performance.now();
  console.debug(`Canvas computation took ${endTime - startTime}ms`);

  setCanvasState({
    dimensions,
    center: {
      x: dimensions.width / 2,
      y: dimensions.height / 2,
    },
  });
}, [imageDimensions]);
```

## 8. Canvas 渲染策略优化

### 8.1 基础组件抽象

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

### 8.2 渲染策略模式

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

### 8.3 统一的 Canvas 容器

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

### 8.4 错误处理和类型安全

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

### 8.5 使用示例

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

### 8.6 优化效果

1. **代码组织**：

   - 清晰的组件层次结构
   - 职责明确的策略模式
   - 统一的错误处理机制

2. **性能提升**：

   - 减少重复渲染
   - 优化条件判断
   - 缓存计算结果

3. **可维护性**：

   - 易于添加新的渲染策略
   - 统一的属性接口
   - 类型安全的实现

4. **可靠性**：
   - 完善的错误处理
   - 降级渲染机制
   - 运行时类型检查

## 9. 菜单系统实现

### 9.1 整体架构

```typescript
// 1. 顶层容器
const EditorPanels: FC = () => {
  const {activateCate} = useSelector(
    (state: iRootState) => state.editorMainCategory,
  );

  return (
    <View style={styles.container}>
      {activateCate === MainCategoryType.filter && <FilterEditor />}
      {/* 其他编辑器... */}
    </View>
  );
};

// 2. 编辑器基类
const CommonEditor: FC = ({children}) => {
  const {selectedLeveloneMenus, activateMenu} = useSelector(
    (state: iRootState) => state.editorMainCategory,
  );

  return (
    <View>
      <ScrollTabs
        levelone_menu={selectedLeveloneMenus}
        active={activateMenu}
        onChange={srcollSwiper}
      />
      {children}
    </View>
  );
};

// 3. 具体编辑器（以 FilterEditor 为例）
const FilterEditor: FC = () => {
  return (
    <CommonEditor>
      <FilterList />
    </CommonEditor>
  );
};
```

### 9.2 菜单列表实现（以 FilterList 为例）

```typescript
const FilterList: FC<{
  onSetSelectedLut?: (lut_name: string) => void;
}> = ({onSetSelectedLut}) => {
  // 1. 状态管理
  const {selectedOptions} = useSelector(
    (state: iRootState) => state.editorMainCategory,
  );
  const [dynamicIconUrls, setDynamicIconUrls] = useState<
    Editor.EditorOptionDynamicItem[]
  >([]);

  // 2. 动态加载选项
  useEffect(() => {
    getOptionsDynamicUrl(selectedOptions).then(res => setDynamicIconUrls(res));
  }, [selectedOptions]);

  // 3. 渲染列表项
  const _renderItem: ListRenderItem<Editor.EditorOptionDynamicItem> =
    useCallback(
      ({item}) => (
        <NormalButton
          onPress={onSetSelectedLut?.bind(
            null,
            item.filter_options?.filter_assets_id!,
          )}
          style={itemStyle}>
          <TextCloudImageIcon
            text={item.item_name}
            text_en={item.item_name_en}
            item_url={item.private_url}
          />
        </NormalButton>
      ),
      [dynamicIconUrls],
    );

  // 4. 列表渲染
  return (
    <View style={styles.container}>
      <FlashList
        data={dynamicIconUrls}
        renderItem={_renderItem}
        horizontal
        estimatedItemSize={64}
        keyExtractor={item => item.uuid}
      />
    </View>
  );
};
```

### 9.3 数据流

1. **状态管理**：

   - Redux 存储全局状态（当前分类、选中选项等）
   - Local State 管理组件内部状态（动态 URL 等）
   - Context 管理特定功能状态（如涂鸦工具）

2. **数据加载流程**：

   ```typescript
   // 1. 加载一级菜单
   onLoadLeveloneMenus(activateCate).then(() =>
     updateActivateCate(activateCate),
   );

   // 2. 加载编辑选项
   onLoadOptions({
     category_id: activateCate,
     type_id: defaultType_id,
   }).then(() => updateActivateMenu(defaultType_id));

   // 3. 加载动态资源
   getOptionsDynamicUrl(selectedOptions).then(res => setDynamicIconUrls(res));
   ```

### 9.4 交互设计

1. **滚动交互**：

   ```typescript
   // 1. 记录选项位置
   const _cateItemsRect: {
     x: number;
     y: number;
     width: number;
     height: number;
   }[] = [];

   // 2. 自动滚动到选中项
   useEffect(() => {
     const scrollW = DeviceUtil.window.width;
     const activeCate = _cateItemsRect[active];
     if (!activeCate) return;

     const scrollX = activeCate.x - (scrollW / 2 - activeCate.width / 2);
     _cateScrollview?.current?.scrollTo({
       x: scrollX,
       y: 0,
       animated: true,
     });
   }, [active]);
   ```

2. **视觉反馈**：

   ```typescript
   // 1. 选中状态样式
   const styles = StyleSheet.create({
     cateBoxActive: {
       borderBottomColor: mainColor,
       borderBottomWidth: 2,
       borderRadius: 2,
     },
   });

   // 2. 应用选中样式
   <NormalButton
     style={[
       styles.cateBox,
       key === active && !eraseSelected && styles.cateBoxActive,
     ]}>
     {/* 按钮内容 */}
   </NormalButton>;
   ```

### 9.5 性能考虑

1. **列表优化**：

   - 使用 FlashList 替代普通 FlatList
   - 设置 estimatedItemSize 提高性能
   - 使用 horizontal 实现横向滚动

2. **渲染优化**：

   - 使用 useCallback 缓存渲染函数
   - 使用 memo 优化组件重渲染
   - 合理使用 useEffect 依赖项

3. **资源加载**：
   - 动态加载图标资源
   - 缓存已加载的资源
   - 处理加载错误情况

### 9.6 可扩展性

1. **新增编辑器**：

   ```typescript
   // 1. 定义新的编辑器类型
   enum MainCategoryType {
     filter = 0,
     newEditor = 1,
     // ...
   }

   // 2. 实现新的编辑器组件
   const NewEditor: FC = () => {
     return (
       <CommonEditor>
         <NewEditorList />
       </CommonEditor>
     );
   };

   // 3. 在 EditorPanels 中添加
   {
     activateCate === MainCategoryType.newEditor && <NewEditor />;
   }
   ```

2. **自定义选项**：

   ```typescript
   // 1. 定义选项接口
   interface EditorOption {
     type_id: number;
     type_name: string;
     type_name_en: string;
     show_type: TabType;
     private_url: string;
   }

   // 2. 实现选项组件
   const CustomOption: FC<EditorOption> = props => {
     // 实现自定义选项的渲染逻辑
   };
   ```

## 10. Canvas 实现优化与手势管理

### 10.1 Canvas 层级优化

```typescript
// 1. 统一的 Canvas 层级管理
interface CanvasLayer {
  id: string;
  type: 'image' | 'sticker' | 'text' | 'filter';
  zIndex: number;
  content: React.ReactNode;
  isSelected: boolean;
}

// 2. 单一 Canvas 容器
const EditorCanvas: FC = () => {
  const [layers, setLayers] = useState<CanvasLayer[]>([]);

  return (
    <Canvas style={[styles.canvas, {width, height}]}>
      <Group>
        {layers
          .sort((a, b) => a.zIndex - b.zIndex)
          .map(layer => (
            <Group key={layer.id}>{layer.content}</Group>
          ))}
      </Group>
    </Canvas>
  );
};
```

优化点：

1. **单一 Canvas 实例**：

   - 减少内存占用
   - 提高渲染性能
   - 简化状态管理

2. **统一的图层管理**：

   - 清晰的层级关系
   - 方便的图层操作（移动、删除、调整顺序）
   - 集中的状态管理

3. **性能优化**：
   ```typescript
   // 使用 useMemo 缓存图层渲染
   const renderedLayers = useMemo(
     () =>
       layers
         .sort((a, b) => a.zIndex - b.zIndex)
         .map(layer => <Group key={layer.id}>{layer.content}</Group>),
     [layers],
   );
   ```

### 10.2 手势管理系统

```typescript
// 1. 手势状态管理
interface GestureState {
  activeLayerId: string | null;
  gestureEnabled: boolean;
  currentGesture: 'pan' | 'pinch' | 'rotate' | null;
}

// 2. 手势管理器
const GestureManager: FC = () => {
  const [gestureState, setGestureState] = useState<GestureState>({
    activeLayerId: null,
    gestureEnabled: true,
    currentGesture: null,
  });

  // 手势处理器
  const gestureHandler = Gesture.Simultaneous([
    Gesture.Pan()
      .enabled(!!gestureState.activeLayerId)
      .onStart(() => {
        setGestureState(prev => ({
          ...prev,
          currentGesture: 'pan',
        }));
      }),
    // 其他手势...
  ]);

  return (
    <GestureDetector gesture={gestureHandler}>
      <EditorCanvas />
    </GestureDetector>
  );
};
```

关键特性：

1. **图层选择机制**：

   ```typescript
   // 图层选择处理
   const handleLayerSelect = (layerId: string) => {
     // 1. 更新选中状态
     setLayers(prev =>
       prev.map(layer => ({
         ...layer,
         isSelected: layer.id === layerId,
       })),
     );

     // 2. 更新手势状态
     setGestureState(prev => ({
       ...prev,
       activeLayerId: layerId,
       gestureEnabled: true,
     }));

     // 3. 调整图层顺序
     bringLayerToFront(layerId);
   };
   ```

2. **手势互斥控制**：

   ```typescript
   // 手势互斥管理
   const gestureExclusivityManager = {
     isGestureAllowed: (
       layerId: string,
       gestureType: 'pan' | 'pinch' | 'rotate',
     ) => {
       const layer = layers.find(l => l.id === layerId);
       if (!layer || !layer.isSelected) return false;

       // 检查当前是否有其他手势在进行
       if (
         gestureState.currentGesture &&
         gestureState.currentGesture !== gestureType
       ) {
         return false;
       }

       return true;
     },
   };
   ```

3. **图层状态同步**：

   ```typescript
   // 图层状态同步系统
   const LayerStateManager = {
     // 1. 更新图层变换
     updateLayerTransform: (layerId: string, transform: Transform) => {
       if (
         !gestureExclusivityManager.isGestureAllowed(
           layerId,
           gestureState.currentGesture!,
         )
       )
         return;

       setLayers(prev =>
         prev.map(layer =>
           layer.id === layerId ? {...layer, transform} : layer,
         ),
       );
     },

     // 2. 同步图层状态
     syncLayerStates: () => {
       // 确保所有图层状态一致
       const activeLayer = layers.find(l => l.isSelected);
       if (activeLayer) {
         setGestureState(prev => ({
           ...prev,
           activeLayerId: activeLayer.id,
         }));
       }
     },
   };
   ```

### 10.3 性能优化策略

1. **选择性渲染**：

   ```typescript
   const LayerRenderer: FC<{layer: CanvasLayer}> = memo(
     ({layer}) => {
       // 只在必要时重新渲染图层
       const shouldRender = useMemo(
         () => layer.isSelected || layer.type === 'image',
         [layer.isSelected, layer.type],
       );

       if (!shouldRender) return null;

       return <Group>{layer.content}</Group>;
     },
     (prev, next) => prev.layer.id === next.layer.id,
   );
   ```

2. **变换优化**：
   ```typescript
   // 使用 worklet 优化手势性能
   const transformWorklet = useWorkletCallback(
     (transform: Transform) => {
       'worklet';
       // 在 UI 线程直接更新变换
       runOnUI(() => {
         if (!gestureState.activeLayerId) return;
         LayerStateManager.updateLayerTransform(
           gestureState.activeLayerId,
           transform,
         );
       })();
     },
     [gestureState.activeLayerId],
   );
   ```

### 10.4 扩展性设计

1. **新增图层类型**：

   ```typescript
   // 1. 扩展图层类型
   type LayerType = 'image' | 'sticker' | 'text' | 'filter' | 'newType';

   // 2. 图层工厂
   const LayerFactory = {
     create: (type: LayerType, props: any): CanvasLayer => {
       const baseLayer = {
         id: generateUniqueId(),
         zIndex: getNextZIndex(),
         isSelected: false,
       };

       switch (type) {
         case 'image':
           return {
             ...baseLayer,
             type,
             content: <ImageLayer {...props} />,
           };
         // 其他类型...
         default:
           throw new Error(`Unknown layer type: ${type}`);
       }
     },
   };
   ```

2. **自定义手势**：

   ```typescript
   // 手势注册系统
   const GestureRegistry = {
     gestures: new Map<string, Gesture>(),

     register: (type: string, gestureConfig: GestureConfig) => {
       const gesture = createGesture(gestureConfig);
       GestureRegistry.gestures.set(type, gesture);
     },

     getGesture: (type: string) => GestureRegistry.gestures.get(type),
   };
   ```

## 11. 画笔系统设计

### 11.1 画笔图层特殊处理

```typescript
// 1. 扩展图层类型
interface BrushLayer extends CanvasLayer {
  type: 'brush';
  paths: Path2D[]; // 存储所有笔画路径
  currentPath?: Path2D; // 当前正在绘制的路径
  style: {
    color: string;
    width: number;
    opacity: number;
  };
  isEraser: boolean;
}

// 2. 路径历史记录
interface PathHistory {
  paths: Path2D[];
  style: BrushLayer['style'];
  isEraser: boolean;
}

// 3. 画笔状态管理
const BrushStateManager = {
  history: [] as PathHistory[],
  currentIndex: -1,

  // 添加新路径
  addPath(path: Path2D, style: BrushLayer['style'], isEraser: boolean) {
    // 清除当前位置之后的历史
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push({paths: [path], style, isEraser});
    this.currentIndex++;
  },

  // 撤销
  undo() {
    if (this.currentIndex >= 0) {
      this.currentIndex--;
      return true;
    }
    return false;
  },

  // 重做
  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return true;
    }
    return false;
  },
};
```

### 11.2 画笔手势处理

```typescript
// 1. 画笔手势管理器
const BrushGestureManager: FC = () => {
  const [brushState, setBrushState] = useState({
    isDrawing: false,
    isEraser: false,
    currentPath: null as Path2D | null,
  });

  // 画笔手势
  const brushGesture = Gesture.Pan()
    .enabled(!gestureState.activeLayerId) // 只在没有选中其他图层时启用
    .onStart(event => {
      const newPath = new Path2D();
      newPath.moveTo(event.x, event.y);
      setBrushState(prev => ({
        ...prev,
        isDrawing: true,
        currentPath: newPath,
      }));
    })
    .onUpdate(event => {
      if (!brushState.currentPath) return;
      brushState.currentPath.lineTo(event.x, event.y);
      // 实时更新路径
      updateBrushLayer();
    })
    .onEnd(() => {
      if (!brushState.currentPath) return;
      // 保存路径到历史记录
      BrushStateManager.addPath(
        brushState.currentPath,
        currentStyle,
        brushState.isEraser,
      );
      setBrushState(prev => ({
        ...prev,
        isDrawing: false,
        currentPath: null,
      }));
    });

  return (
    <GestureDetector gesture={brushGesture}>
      <BrushCanvas />
    </GestureDetector>
  );
};
```

### 11.3 橡皮擦实现

```typescript
// 1. 橡皮擦模式
const EraserMode = {
  // 检查点是否在路径上
  isPointInPath(x: number, y: number, path: Path2D): boolean {
    const context = canvasRef.current.getContext('2d');
    return context.isPointInPath(path, x, y);
  },

  // 擦除指定位置
  erase(x: number, y: number, radius: number) {
    layers.forEach(layer => {
      if (layer.type !== 'brush') return;

      // 过滤掉被擦除的路径
      layer.paths = layer.paths.filter(path => {
        const bounds = path.getBoundingBox();
        // 检查是否与擦除区域相交
        if (!intersectsWithCircle(bounds, {x, y, radius})) {
          return true;
        }
        // 详细的路径检查
        return !isPathIntersectWithCircle(path, {x, y, radius});
      });
    });
  },
};

// 2. 橡皮擦手势
const eraserGesture = Gesture.Pan()
  .enabled(brushState.isEraser)
  .onStart(event => {
    EraserMode.erase(event.x, event.y, eraserRadius);
  })
  .onUpdate(event => {
    EraserMode.erase(event.x, event.y, eraserRadius);
  });
```

### 11.4 撤销/重做实现

```typescript
// 1. 操作管理器
const BrushOperationManager = {
  // 撤销
  undo() {
    if (BrushStateManager.undo()) {
      // 重新渲染到指定历史状态
      renderToHistoryState(BrushStateManager.currentIndex);
    }
  },

  // 重做
  redo() {
    if (BrushStateManager.redo()) {
      renderToHistoryState(BrushStateManager.currentIndex);
    }
  },

  // 渲染历史状态
  renderToHistoryState(index: number) {
    // 清除画布
    clearCanvas();

    // 重新渲染到指定状态
    BrushStateManager.history
      .slice(0, index + 1)
      .forEach(({paths, style, isEraser}) => {
        paths.forEach(path => {
          if (isEraser) {
            applyEraserPath(path);
          } else {
            drawPath(path, style);
          }
        });
      });
  },
};

// 2. 快捷键绑定
useEffect(() => {
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey) {
      if (event.key === 'z') {
        event.shiftKey
          ? BrushOperationManager.redo()
          : BrushOperationManager.undo();
      }
    }
  };

  document.addEventListener('keydown', handleKeyPress);
  return () => document.removeEventListener('keydown', handleKeyPress);
}, []);
```

### 11.5 性能优化

```typescript
// 1. 路径优化
const PathOptimizer = {
  // 简化路径点
  simplifyPath(path: Path2D, tolerance: number): Path2D {
    const points = extractPointsFromPath(path);
    const simplified = simplifyPoints(points, tolerance);
    return createPathFromPoints(simplified);
  },

  // 分块渲染
  chunkRender(paths: Path2D[]) {
    const CHUNK_SIZE = 10;
    let currentChunk = 0;

    const renderChunk = () => {
      const start = currentChunk * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, paths.length);

      paths.slice(start, end).forEach(path => {
        drawPath(path);
      });

      currentChunk++;
      if (currentChunk * CHUNK_SIZE < paths.length) {
        requestAnimationFrame(renderChunk);
      }
    };

    renderChunk();
  },
};

// 2. 缓存优化
const BrushRenderCache = {
  // 缓存画布
  offscreenCanvas: null as OffscreenCanvas | null,

  // 初始化缓存
  initCache(width: number, height: number) {
    this.offscreenCanvas = new OffscreenCanvas(width, height);
  },

  // 更新缓存
  updateCache(path: Path2D, style: BrushLayer['style']) {
    const ctx = this.offscreenCanvas!.getContext('2d');
    ctx.save();
    applyStyle(ctx, style);
    ctx.stroke(path);
    ctx.restore();
  },
};
```

### 11.6 使用示例

```typescript
// 1. 画笔编辑器组件
const BrushEditor: FC = () => {
  const [brushConfig, setBrushConfig] = useState({
    color: '#000000',
    width: 2,
    opacity: 1,
    isEraser: false,
  });

  // 工具栏
  const Toolbar = () => (
    <View style={styles.toolbar}>
      <ColorPicker
        color={brushConfig.color}
        onChange={color => setBrushConfig(prev => ({...prev, color}))}
      />
      <Slider
        value={brushConfig.width}
        onChange={width => setBrushConfig(prev => ({...prev, width}))}
      />
      <Button
        title={brushConfig.isEraser ? '画笔' : '橡皮擦'}
        onPress={() =>
          setBrushConfig(prev => ({
            ...prev,
            isEraser: !prev.isEraser,
          }))
        }
      />
      <Button title="撤销" onPress={BrushOperationManager.undo} />
      <Button title="重做" onPress={BrushOperationManager.redo} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Toolbar />
      <BrushGestureManager config={brushConfig}>
        <BrushCanvas />
      </BrushGestureManager>
    </View>
  );
};

// 2. 在主编辑器中使用
const EditorHome: FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <EditorCanvas>
        <BrushEditor />
      </EditorCanvas>
    </SafeAreaView>
  );
};
```

## 12. 自定义笔触系统

### 12.1 笔触定义

```typescript
// 1. 基础笔触接口
interface BrushStroke {
  // 基础属性
  type: 'simple' | 'pattern' | 'particle' | 'texture';
  width: number;
  opacity: number;
  color: string;

  // 笔触特效
  effects?: {
    pressure?: boolean; // 压感支持
    tilt?: boolean; // 倾斜支持
    velocity?: boolean; // 速度响应
  };

  // 渲染方法
  render(
    ctx: CanvasRenderingContext2D,
    path: Path2D,
    params: StrokeParams,
  ): void;
}

// 2. 笔触参数
interface StrokeParams {
  pressure: number; // 压力值 0-1
  tilt: {x: number; y: number}; // 倾斜角度
  velocity: number; // 绘制速度
  timestamp: number; // 时间戳
}

// 3. 特殊笔触实现
interface PatternStroke extends BrushStroke {
  type: 'pattern';
  pattern: {
    image: HTMLImageElement;
    spacing: number;
    scale: number;
    rotation: number;
  };
}

interface ParticleStroke extends BrushStroke {
  type: 'particle';
  particles: {
    count: number;
    size: number;
    spread: number;
    lifetime: number;
  };
}

interface TextureStroke extends BrushStroke {
  type: 'texture';
  texture: {
    image: HTMLImageElement;
    blendMode: GlobalCompositeOperation;
    scale: number;
    angle: number;
  };
}
```

### 12.2 笔触实现示例

```typescript
// 1. 艺术笔刷
const ArtisticBrush: PatternStroke = {
  type: 'pattern',
  width: 20,
  opacity: 0.8,
  color: '#000000',
  pattern: {
    image: patternImage,
    spacing: 5,
    scale: 1,
    rotation: 0,
  },
  effects: {
    pressure: true,
    velocity: true,
  },

  render(ctx, path, params) {
    ctx.save();

    // 根据压力调整大小
    const scale = this.pattern.scale * (0.5 + params.pressure * 0.5);
    // 根据速度调整间距
    const spacing = this.pattern.spacing * (1 + params.velocity * 0.5);

    // 设置图案
    const pattern = ctx.createPattern(this.pattern.image, 'repeat');
    ctx.strokeStyle = pattern;

    // 应用变换
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    // 绘制
    ctx.stroke(path);
    ctx.restore();
  },
};

// 2. 粒子笔刷
const ParticleBrush: ParticleStroke = {
  type: 'particle',
  width: 10,
  opacity: 0.6,
  color: '#ff0000',
  particles: {
    count: 20,
    size: 2,
    spread: 10,
    lifetime: 1000,
  },
  effects: {
    pressure: true,
    velocity: true,
  },

  render(ctx, path, params) {
    // 沿路径生成粒子
    const points = extractPointsFromPath(path);
    points.forEach(point => {
      // 根据压力调整粒子数量
      const count = this.particles.count * params.pressure;

      // 生成粒子
      for (let i = 0; i < count; i++) {
        createParticle({
          x: point.x + Math.random() * this.particles.spread,
          y: point.y + Math.random() * this.particles.spread,
          size: this.particles.size,
          color: this.color,
          lifetime: this.particles.lifetime,
        });
      }
    });
  },
};

// 3. 水彩笔刷
const WatercolorBrush: TextureStroke = {
  type: 'texture',
  width: 30,
  opacity: 0.4,
  color: '#0000ff',
  texture: {
    image: watercolorTexture,
    blendMode: 'multiply',
    scale: 1,
    angle: 0,
  },
  effects: {
    pressure: true,
    tilt: true,
  },

  render(ctx, path, params) {
    ctx.save();

    // 设置混合模式
    ctx.globalCompositeOperation = this.texture.blendMode;

    // 根据倾斜调整纹理角度
    const angle = this.texture.angle + Math.atan2(params.tilt.y, params.tilt.x);

    // 应用纹理
    ctx.setTransform(
      Math.cos(angle),
      Math.sin(angle),
      -Math.sin(angle),
      Math.cos(angle),
      0,
      0,
    );

    // 绘制
    ctx.drawImage(
      this.texture.image,
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height,
    );

    ctx.restore();
  },
};
```

### 12.3 笔触管理系统

```typescript
// 1. 笔触管理器
const BrushManager = {
  brushes: new Map<string, BrushStroke>(),

  // 注册笔触
  register(id: string, brush: BrushStroke) {
    this.brushes.set(id, brush);
  },

  // 获取笔触
  getBrush(id: string): BrushStroke | undefined {
    return this.brushes.get(id);
  },

  // 创建笔触实例
  createBrushInstance(id: string, options: Partial<BrushStroke>) {
    const brush = this.getBrush(id);
    if (!brush) throw new Error(`Brush ${id} not found`);
    return {...brush, ...options};
  },
};

// 2. 笔触参数收集器
const StrokeParamsCollector = {
  lastPoint: null as Point | null,
  lastTimestamp: 0,

  collect(event: PointerEvent): StrokeParams {
    const now = Date.now();
    const point = {x: event.x, y: event.y};

    // 计算速度
    const velocity = this.lastPoint
      ? getDistance(this.lastPoint, point) / (now - this.lastTimestamp)
      : 0;

    // 收集参数
    const params: StrokeParams = {
      pressure: event.pressure,
      tilt: {
        x: event.tiltX,
        y: event.tiltY,
      },
      velocity,
      timestamp: now,
    };

    // 更新状态
    this.lastPoint = point;
    this.lastTimestamp = now;

    return params;
  },
};
```

### 12.4 高级效果实现

```typescript
// 1. 笔触混合器
const BrushBlender = {
  // 混合两种笔触
  blend(brush1: BrushStroke, brush2: BrushStroke, ratio: number): BrushStroke {
    return {
      ...brush1,
      render(ctx, path, params) {
        // 渲染第一个笔触
        brush1.render(ctx, path, params);

        // 设置混合模式和透明度
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = ratio;

        // 渲染第二个笔触
        brush2.render(ctx, path, params);
      },
    };
  },
};

// 2. 笔触变形器
const BrushDeformer = {
  // 添加抖动效果
  addJitter(brush: BrushStroke, amount: number): BrushStroke {
    return {
      ...brush,
      render(ctx, path, params) {
        const jitteredPath = new Path2D();
        const points = extractPointsFromPath(path);

        points.forEach(point => {
          const jitter = amount * (Math.random() - 0.5);
          jitteredPath.lineTo(point.x + jitter, point.y + jitter);
        });

        brush.render(ctx, jitteredPath, params);
      },
    };
  },

  // 添加模糊效果
  addBlur(brush: BrushStroke, radius: number): BrushStroke {
    return {
      ...brush,
      render(ctx, path, params) {
        // 在离屏画布上渲染
        const offscreen = new OffscreenCanvas(
          ctx.canvas.width,
          ctx.canvas.height,
        );
        const offscreenCtx = offscreen.getContext('2d');

        // 渲染原始笔触
        brush.render(offscreenCtx, path, params);

        // 应用模糊
        ctx.filter = `blur(${radius}px)`;
        ctx.drawImage(offscreen, 0, 0);
        ctx.filter = 'none';
      },
    };
  },
};
```

### 12.5 使用示例

```typescript
// 1. 注册笔触
BrushManager.register('artistic', ArtisticBrush);
BrushManager.register('particle', ParticleBrush);
BrushManager.register('watercolor', WatercolorBrush);

// 2. 创建自定义笔触
const customBrush = BrushManager.createBrushInstance('artistic', {
  width: 15,
  color: '#ff0000',
  pattern: {
    spacing: 3,
    rotation: Math.PI / 4,
  },
});

// 3. 创建特效笔触
const specialBrush = BrushDeformer.addBlur(
  BrushDeformer.addJitter(customBrush, 5),
  2,
);

// 4. 在画笔编辑器中使用
const BrushEditor: FC = () => {
  const [activeBrush, setActiveBrush] = useState(customBrush);

  return (
    <View style={styles.container}>
      <BrushPresets
        onSelect={brush => setActiveBrush(brush)}
        presets={[
          customBrush,
          specialBrush,
          BrushBlender.blend(customBrush, ParticleBrush, 0.5),
        ]}
      />
      <BrushCanvas
        brush={activeBrush}
        onStroke={(path, params) => {
          activeBrush.render(ctx, path, params);
        }}
      />
    </View>
  );
};
```

### 12.6 仙女棒笔刷实现

```typescript
// 1. 火花粒子定义
interface SparkParticle {
  x: number;
  y: number;
  vx: number; // x方向速度
  vy: number; // y方向速度
  size: number;
  color: string;
  life: number; // 生命周期
  opacity: number;
}

// 2. 仙女棒笔刷实现
const SparklerBrush: ParticleStroke = {
  type: 'particle',
  width: 2,
  opacity: 1,
  color: '#FFD700', // 金色基础色
  particles: {
    count: 35, // 每帧产生的火花数
    size: 2,
    spread: 15, // 散射范围
    lifetime: 1000, // 粒子生命周期
  },

  // 粒子系统
  particleSystem: {
    particles: [] as SparkParticle[],
    gravity: 0.1, // 重力影响

    // 创建新粒子
    createParticle(x: number, y: number, pressure: number): SparkParticle {
      const angle = Math.random() * Math.PI * 2;
      const speed = (2 + Math.random() * 3) * pressure; // 速度受压力影响

      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random(),
        color: this.getSparkColor(),
        life: 1,
        opacity: 1,
      };
    },

    // 获取火花颜色（随机在金色到白色之间）
    getSparkColor(): string {
      const colors = [
        '#FFD700', // 金色
        '#FFF3A0', // 浅金色
        '#FFFFFF', // 白色
        '#FFE45C', // 明亮金色
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    },

    // 更新粒子状态
    updateParticles() {
      this.particles = this.particles
        .filter(p => p.life > 0)
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + this.gravity,
          life: p.life - 0.02,
          opacity: p.life,
        }));
    },
  },

  render(ctx: CanvasRenderingContext2D, path: Path2D, params: StrokeParams) {
    ctx.save();

    // 1. 设置合成模式以实现发光效果
    ctx.globalCompositeOperation = 'lighter';

    // 2. 提取路径点
    const points = extractPointsFromPath(path);
    const currentPoint = points[points.length - 1];

    // 3. 创建新的火花粒子
    const particleCount = this.particles.count * params.pressure;
    for (let i = 0; i < particleCount; i++) {
      this.particleSystem.particles.push(
        this.particleSystem.createParticle(
          currentPoint.x,
          currentPoint.y,
          params.pressure,
        ),
      );
    }

    // 4. 更新和渲染所有粒子
    this.particleSystem.updateParticles();

    // 5. 渲染火花
    this.particleSystem.particles.forEach(p => {
      // 主火花
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();

      // 发光效果
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fill();
    });

    ctx.restore();
  },
};

// 3. 使用示例
const sparklerBrushInstance = BrushManager.createBrushInstance('sparkler', {
  particles: {
    count: 50, // 增加火花数量
    spread: 20, // 增加散射范围
    lifetime: 1500, // 增加生命周期
  },
});

// 4. 动画循环
function animateSparkler(
  brush: typeof SparklerBrush,
  ctx: CanvasRenderingContext2D,
) {
  function animate() {
    // 清除上一帧
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 渲染当前帧
    brush.particleSystem.updateParticles();
    brush.render(ctx, new Path2D(), {
      pressure: 1,
      velocity: 0,
      timestamp: Date.now(),
    });

    // 继续动画循环
    requestAnimationFrame(animate);
  }

  animate();
}
```

这个实现的特点：

1. **物理模拟**

   - 使用速度向量 (vx, vy) 模拟火花运动
   - 添加重力影响使火花自然下落
   - 基于压力参数调整火花速度

2. **视觉效果**

   - 使用 `lighter` 混合模式叠加火花亮度
   - 通过 `shadowBlur` 创建发光效果
   - 使用金色系渐变色彩提升视觉效果

3. **性能优化**

   - 使用粒子池管理火花对象
   - 及时清除生命周期结束的粒子
   - 使用 `requestAnimationFrame` 优化动画性能

4. **交互体验**
   - 支持压感控制火花密度
   - 可自定义火花颜色和散射范围
   - 平滑的动画过渡效果

### 12.7 高性能可扩展笔刷系统

```typescript
// 1. 核心渲染引擎接口
interface RenderEngine {
  type: 'canvas2d' | 'webgl' | 'webgpu';
  context: any;
  init(canvas: HTMLCanvasElement): void;
  render(scene: Scene): void;
  dispose(): void;
}

// 2. 模块化的粒子系统
interface ParticleSystem {
  // 粒子发射器
  emitter: {
    rate: number; // 发射速率
    burst: number; // 爆发量
    shape: EmitterShape; // 发射形状
    direction: Vector2D; // 发射方向
  };

  // 粒子行为
  behaviors: ParticleBehavior[];

  // 粒子属性
  properties: {
    initialProperties: ParticleProperties;
    evolution: PropertyEvolution[];
  };

  // 渲染器
  renderer: ParticleRenderer;
}

// 3. 可组合的粒子行为
interface ParticleBehavior {
  type: string;
  update(particle: Particle, deltaTime: number): void;
}

// 示例行为
const GravityBehavior: ParticleBehavior = {
  type: 'gravity',
  strength: 9.8,
  update(particle, dt) {
    particle.velocity.y += this.strength * dt;
  },
};

const TurbulenceBehavior: ParticleBehavior = {
  type: 'turbulence',
  frequency: 0.1,
  amplitude: 1.0,
  update(particle, dt) {
    const noise = simplex3D(
      particle.position.x * this.frequency,
      particle.position.y * this.frequency,
      particle.age * this.frequency,
    );
    particle.velocity.x += noise.x * this.amplitude;
    particle.velocity.y += noise.y * this.amplitude;
  },
};

// 4. 属性演化系统
interface PropertyEvolution {
  property: keyof ParticleProperties;
  curve: AnimationCurve;
  evaluate(time: number): number;
}

// 5. GPU 加速的粒子计算
class GPUParticleSystem {
  private computeShader: WebGLShader;
  private particleBuffer: WebGLBuffer;

  constructor(gl: WebGLRenderingContext, maxParticles: number) {
    // 初始化 GPU 缓冲区
    this.particleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      maxParticles * PARTICLE_STRIDE,
      gl.DYNAMIC_DRAW,
    );

    // 编译计算着色器
    this.computeShader = this.createComputeShader();
  }

  // 使用 GPU 更新粒子
  updateParticles(deltaTime: number) {
    // 在 GPU 上并行计算粒子状态
  }
}

// 6. 笔刷配置系统
interface BrushConfig {
  // 基础属性
  name: string;
  category: string;
  thumbnail?: string;

  // 粒子系统配置
  particleSystem: Partial<ParticleSystem>;

  // 行为配置
  behaviors: {
    [key: string]: Partial<ParticleBehavior>;
  };

  // 演化曲线
  evolutions: {
    [key: string]: Partial<PropertyEvolution>;
  };

  // 渲染器配置
  renderer: Partial<ParticleRenderer>;
}

// 7. 示例：创建自定义笔刷
const createCustomBrush = (config: BrushConfig): Brush => {
  return {
    // 合并默认配置和自定义配置
    ...defaultBrushConfig,
    ...config,

    // 初始化粒子系统
    init() {
      this.particleSystem = new GPUParticleSystem(
        gl,
        config.particleSystem.maxParticles,
      );

      // 添加行为
      Object.entries(config.behaviors).forEach(([key, behavior]) => {
        this.particleSystem.addBehavior(createBehavior(key, behavior));
      });

      // 设置演化曲线
      Object.entries(config.evolutions).forEach(([property, evolution]) => {
        this.particleSystem.addEvolution(property, evolution);
      });
    },

    // 自定义更新逻辑
    update(dt: number) {
      this.particleSystem.update(dt);
    },

    // 自定义渲染逻辑
    render(renderer: RenderEngine) {
      this.particleSystem.render(renderer);
    },
  };
};

// 8. 使用示例：创建新的笔刷效果
const fireworksBrush = createCustomBrush({
  name: 'Fireworks',
  category: 'Special Effects',

  particleSystem: {
    emitter: {
      rate: 100,
      burst: 500,
      shape: 'point',
      direction: {x: 0, y: -1},
    },
  },

  behaviors: {
    gravity: {
      strength: 5.0,
    },
    turbulence: {
      frequency: 0.2,
      amplitude: 2.0,
    },
    split: {
      threshold: 0.5,
      childCount: 10,
    },
  },

  evolutions: {
    size: {
      curve: 'easeOutQuad',
      range: [5, 0],
    },
    color: {
      curve: 'linear',
      colors: ['#FFD700', '#FF0000', '#0000FF'],
    },
  },

  renderer: {
    blendMode: 'additive',
    shader: 'particle_glow',
  },
});

// 9. 性能优化
class ParticlePool {
  private pool: Particle[] = [];
  private active: Set<Particle> = new Set();

  acquire(): Particle {
    let particle = this.pool.pop();
    if (!particle) {
      particle = new Particle();
    }
    this.active.add(particle);
    return particle;
  }

  release(particle: Particle) {
    this.active.delete(particle);
    this.pool.push(particle);
  }
}

// 10. 四叉树优化
class ParticleQuadTree {
  private root: QuadTreeNode;

  insert(particle: Particle) {
    this.root.insert(particle);
  }

  query(bounds: Bounds): Particle[] {
    return this.root.query(bounds);
  }
}
```

这个改进的系统具有以下优势：

1. **模块化设计**

   - 分离渲染引擎、粒子系统、行为系统
   - 可以独立更换或扩展各个模块
   - 支持多种渲染后端（Canvas2D/WebGL/WebGPU）

2. **高性能实现**

   - GPU 加速的粒子计算
   - 粒子池优化内存使用
   - 四叉树优化空间查询
   - 支持大规模粒子系统

3. **灵活的配置系统**

   - 声明式配置笔刷行为
   - 支持复杂的粒子演化
   - 可自定义渲染效果
   - 运行时动态修改参数

4. **丰富的扩展性**
   - 可添加自定义行为
   - 支持自定义发射器
   - 可扩展渲染效果
   - 支持着色器自定义

## 13. 特效笔刷实现

### 13.1 魔法光束笔刷

```typescript
const MagicBeamBrush: BrushStroke = {
  type: 'particle',
  width: 15,
  opacity: 0.8,
  color: '#7B68EE', // 基础紫色
  particles: {
    count: 40,
    size: 3,
    spread: 8,
    lifetime: 800,
  },
  effects: {
    pressure: true,
    velocity: true,
  },

  render(ctx, path, params) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // 主光束
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width * params.pressure;
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;
    ctx.stroke(path);

    // 粒子效果
    const points = extractPointsFromPath(path);
    points.forEach(point => {
      // 发光粒子
      for (let i = 0; i < this.particles.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * this.particles.spread;
        const x = point.x + Math.cos(angle) * radius;
        const y = point.y + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.arc(x, y, this.particles.size * Math.random(), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(123, 104, 238, ${Math.random() * 0.5})`;
        ctx.fill();
      }
    });

    ctx.restore();
  },
};
```

### 13.2 烟雾效果笔刷

```typescript
const SmokeBrush: BrushStroke = {
  type: 'texture',
  width: 25,
  opacity: 0.3,
  color: '#4A4A4A',
  texture: {
    blendMode: 'screen',
    scale: 1.2,
    angle: 0,
  },
  effects: {
    pressure: true,
    tilt: true,
  },

  render(ctx, path, params) {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';

    // 烟雾粒子
    const points = extractPointsFromPath(path);
    points.forEach(point => {
      const size = this.width * params.pressure;
      const alpha = Math.random() * 0.2;

      // 多层叠加实现烟雾效果
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          size,
        );
        gradient.addColorStop(0, `rgba(74, 74, 74, ${alpha})`);
        gradient.addColorStop(0.7, 'rgba(74, 74, 74, 0)');

        ctx.fillStyle = gradient;
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  },
};
```

### 13.3 火焰笔刷

```typescript
const FireBrush: BrushStroke = {
  type: 'particle',
  width: 20,
  opacity: 0.9,
  color: '#FF4500',
  particles: {
    count: 50,
    size: 4,
    spread: 12,
    lifetime: 600,
  },
  effects: {
    pressure: true,
    velocity: true,
  },

  render(ctx, path, params) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const points = extractPointsFromPath(path);
    points.forEach(point => {
      // 火焰核心
      const gradient = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        this.width * params.pressure,
      );
      gradient.addColorStop(0, '#FFFF00');
      gradient.addColorStop(0.4, '#FF4500');
      gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, this.width * params.pressure, 0, Math.PI * 2);
      ctx.fill();

      // 火花粒子
      for (let i = 0; i < this.particles.count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5);
        const speed = params.velocity * (1 + Math.random());
        const size = this.particles.size * Math.random();

        ctx.beginPath();
        ctx.arc(
          point.x + Math.cos(angle) * speed,
          point.y + Math.sin(angle) * speed,
          size,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = `rgba(255, ${
          Math.random() * 200
        }, 0, ${Math.random()})`;
        ctx.fill();
      }
    });

    ctx.restore();
  },
};
```

### 13.4 霓虹效果笔刷

```typescript
const NeonBrush: BrushStroke = {
  type: 'pattern',
  width: 12,
  opacity: 1,
  color: '#FF1493', // 霓虹粉
  effects: {
    pressure: true,
    velocity: true,
  },

  render(ctx, path, params) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // 内发光
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width * params.pressure;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 多层发光效果
    for (let i = 0; i < 3; i++) {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = (3 - i) * 15;
      ctx.stroke(path);
    }

    // 光晕效果
    const points = extractPointsFromPath(path);
    points.forEach(point => {
      const gradient = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        this.width * 2,
      );
      gradient.addColorStop(0, `rgba(255, 20, 147, ${0.2 * params.pressure})`);
      gradient.addColorStop(1, 'rgba(255, 20, 147, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, this.width * 2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  },
};
```

### 13.5 水彩效果笔刷

```typescript
const WatercolorBrush: BrushStroke = {
  type: 'texture',
  width: 30,
  opacity: 0.4,
  color: '#4169E1', // 皇家蓝
  texture: {
    blendMode: 'multiply',
    scale: 1.2,
    angle: 0,
  },
  effects: {
    pressure: true,
    tilt: true,
  },

  render(ctx, path, params) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';

    const points = extractPointsFromPath(path);
    points.forEach(point => {
      // 水彩扩散效果
      const size = this.width * params.pressure;
      const baseAlpha = 0.1 + Math.random() * 0.2;

      // 多层叠加实现水彩效果
      for (let i = 0; i < 4; i++) {
        const radius = size * (0.7 + Math.random() * 0.6);
        const gradient = ctx.createRadialGradient(
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          radius,
        );

        gradient.addColorStop(0, `rgba(65, 105, 225, ${baseAlpha})`);
        gradient.addColorStop(0.7, `rgba(65, 105, 225, ${baseAlpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(65, 105, 225, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();

        // 不规则形状
        ctx.moveTo(point.x + radius, point.y);
        for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
          const rad = radius * (0.9 + Math.random() * 0.2);
          const x = point.x + Math.cos(angle) * rad;
          const y = point.y + Math.sin(angle) * rad;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }
    });

    ctx.restore();
  },
};
```

### 13.6 特效笔刷使用示例

```typescript
// 注册笔刷
BrushManager.register('magicBeam', MagicBeamBrush);
BrushManager.register('smoke', SmokeBrush);
BrushManager.register('fire', FireBrush);
BrushManager.register('neon', NeonBrush);
BrushManager.register('watercolor', WatercolorBrush);

// 创建笔刷选择器组件
const BrushSelector: FC = () => {
  const [activeBrush, setActiveBrush] = useState('magicBeam');

  return (
    <View style={styles.container}>
      <ScrollView horizontal>
        {['magicBeam', 'smoke', 'fire', 'neon', 'watercolor'].map(brushId => (
          <TouchableOpacity
            key={brushId}
            onPress={() => setActiveBrush(brushId)}
            style={[
              styles.brushItem,
              activeBrush === brushId && styles.activeBrush,
            ]}>
            <Text>{brushId}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <BrushCanvas
        brush={BrushManager.getBrush(activeBrush)}
        onStroke={(path, params) => {
          // 渲染笔刷
        }}
      />
    </View>
  );
};
```

### 13.7 特效笔刷特点说明

1. **魔法光束笔刷**

   - 发光的主光束效果
   - 周围环绕粒子效果
   - 使用 lighter 混合模式增强发光感
   - 支持压感控制光束粗细

2. **烟雾效果笔刷**

   - 多层半透明渐变
   - 柔和的 soft-light 混合模式
   - 随机透明度变化
   - 模拟真实烟雾扩散效果

3. **火焰笔刷**

   - 明亮的火焰核心
   - 动态火花粒子
   - 向上飘动的火花效果
   - screen 混合模式增强明亮度

4. **霓虹效果笔刷**

   - 多层发光效果
   - 内发光和外发光结合
   - 光晕扩散效果
   - 圆润的线条端点

5. **水彩效果笔刷**
   - 不规则边缘
   - 多层颜色叠加
   - 水彩扩散效果
   - 支持压感和倾斜

## 14. 优化后的贴纸系统实现

### 14.1 贴纸控制按钮系统

```typescript
// 1. 控制按钮类型定义
interface ControlButton {
  id: string;
  icon: string;
  iconType: 'AntIcon' | 'FontAwesome';
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  action: 'delete' | 'edit' | 'flip' | 'transform';
  gesture?: Gesture;
}

// 2. 控制按钮配置
const CONTROL_BUTTONS: ControlButton[] = [
  {
    id: 'delete',
    icon: 'close',
    iconType: 'AntIcon',
    position: 'topLeft',
    action: 'delete',
  },
  {
    id: 'edit',
    icon: 'edit',
    iconType: 'AntIcon',
    position: 'topRight',
    action: 'edit',
  },
  {
    id: 'flip',
    icon: 'exchange',
    iconType: 'FontAwesome',
    position: 'bottomLeft',
    action: 'flip',
  },
  {
    id: 'transform',
    icon: 'arrowsalt',
    iconType: 'AntIcon',
    position: 'bottomRight',
    action: 'transform',
    gesture: dragGestureButtom,
  },
];

// 3. 控制按钮组件
const ControlButton: FC<{
  button: ControlButton;
  onAction: (action: string) => void;
}> = ({button, onAction}) => {
  const Icon = button.iconType === 'AntIcon' ? AntIcon : FontAwesome;

  const handlePress = useCallback(() => {
    onAction(button.action);
  }, [button.action, onAction]);

  return (
    <Animated.View
      style={iconAnimatedStyles}
      accessible={true}
      accessibilityLabel={`${button.action} sticker`}
      accessibilityRole="button">
      {button.gesture ? (
        <GestureDetector gesture={button.gesture}>
          <NormalButton onPress={handlePress}>
            <Icon
              name={button.icon}
              style={[styles.iconFont, styles[`icon${button.position}`]]}
            />
          </NormalButton>
        </GestureDetector>
      ) : (
        <NormalButton onPress={handlePress}>
          <Icon
            name={button.icon}
            style={[styles.iconFont, styles[`icon${button.position}`]]}
          />
        </NormalButton>
      )}
    </Animated.View>
  );
};
```

### 14.2 贴纸控制框实现

```typescript
// 1. 控制框组件
const StickerControlFrame: FC<{
  id: string;
  width: number;
  height: number;
  onAction: (action: string, id: string) => void;
}> = ({id, width, height, onAction}) => {
  const handleAction = useCallback(
    (action: string) => {
      onAction(action, id);
    },
    [id, onAction],
  );

  return (
    <Animated.View style={animatedStyles}>
      <View
        style={[
          styles.frame,
          {
            width,
            height,
            top: -height / 2,
            left: -width / 2,
          },
        ]}>
        {CONTROL_BUTTONS.map(button => (
          <ControlButton
            key={button.id}
            button={button}
            onAction={handleAction}
          />
        ))}
      </View>
    </Animated.View>
  );
};

// 2. 贴纸状态管理
interface StickerState {
  selectedId: string | null;
  editingId: string | null;
  stickers: Sticker[];
}

type StickerAction =
  | {type: 'delete'; payload: {stickerId: string}}
  | {type: 'edit'; payload: {stickerId: string}}
  | {type: 'flip'; payload: {stickerId: string}}
  | {type: 'transform'; payload: {stickerId: string; transform: Transform}};

const stickerReducer = (
  state: StickerState,
  action: StickerAction,
): StickerState => {
  switch (action.type) {
    case 'delete':
      return {
        ...state,
        stickers: state.stickers.filter(s => s.id !== action.payload.stickerId),
        selectedId: null,
      };
    case 'edit':
      return {
        ...state,
        editingId: action.payload.stickerId,
      };
    case 'flip':
      return {
        ...state,
        stickers: state.stickers.map(s =>
          s.id === action.payload.stickerId
            ? {...s, isFlipped: !s.isFlipped}
            : s,
        ),
      };
    case 'transform':
      return {
        ...state,
        stickers: state.stickers.map(s =>
          s.id === action.payload.stickerId
            ? {...s, transform: action.payload.transform}
            : s,
        ),
      };
    default:
      return state;
  }
};
```

### 14.3 优化后的贴纸主组件

```typescript
export const SvgStickerFrame: FC<StickerFrameProps> = ({
  id,
  svg_str,
  svg_width,
  svg_height,
  canvas_width,
  canvas_height,
  zindex,
}) => {
  // 1. 状态管理
  const [state, dispatch] = useReducer(stickerReducer, {
    selectedId: null,
    editingId: null,
    stickers: [],
  });

  // 2. 变换状态
  const sharedTransform = useSharedValue({
    offset: {x: 0, y: 0},
    scale: 1,
    rotateZ: '0rad',
  });

  // 3. 手势处理
  const handleStickerAction = useCallback(
    (action: string, stickerId: string) => {
      try {
        switch (action) {
          case 'delete':
            dispatch({type: 'delete', payload: {stickerId}});
            break;
          case 'edit':
            dispatch({type: 'edit', payload: {stickerId}});
            break;
          case 'flip':
            dispatch({type: 'flip', payload: {stickerId}});
            break;
          case 'transform':
            // 变换由手势处理
            break;
          default:
            console.warn(`Unknown action: ${action}`);
        }
      } catch (error) {
        console.error(`Error handling sticker action: ${action}`, error);
      }
    },
    [],
  );

  // 4. 渲染
  return (
    <AnimationContext.Provider value={sharedTransform}>
      <View style={styles.container}>
        <Pressable
          onPress={() =>
            dispatch({
              type: 'select',
              payload: {stickerId: id},
            })
          }>
          <SvgSticker
            id={id}
            svg_str={svg_str}
            svg_height={svg_height}
            svg_width={svg_width}
          />
        </Pressable>

        {state.selectedId === id && (
          <StickerControlFrame
            id={id}
            width={svg_width}
            height={svg_height}
            onAction={handleStickerAction}
          />
        )}
      </View>
    </AnimationContext.Provider>
  );
};
```

### 14.4 样式定义

```typescript
const BUTTON_SIZE = 30;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  frame: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: mainColor,
    borderStyle: 'dashed',
  },
  iconPosition: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  iconTopLeft: {
    top: -BUTTON_SIZE / 2,
    left: -BUTTON_SIZE / 2,
  },
  iconTopRight: {
    top: -BUTTON_SIZE / 2,
    right: -BUTTON_SIZE / 2,
  },
  iconBottomLeft: {
    bottom: -BUTTON_SIZE / 2,
    left: -BUTTON_SIZE / 2,
  },
  iconBottomRight: {
    bottom: -BUTTON_SIZE / 2,
    right: -BUTTON_SIZE / 2,
    transform: [{rotate: '90deg'}],
  },
  iconFont: {
    fontSize: mainFontSize,
    color: whiteFontColor,
    padding: 5,
    borderRadius: mainFontSize,
    backgroundColor: mainColor,
  },
});
```

### 14.5 性能优化要点

1. **状态管理优化**：

   - 使用 `useReducer` 统一管理贴纸状态
   - 分离变换状态和业务状态
   - 使用 `useCallback` 优化事件处理

2. **渲染优化**：

   - 组件分离减少重渲染
   - 使用 `memo` 优化纯展示组件
   - 条件渲染优化

3. **手势处理优化**：

   - 统一的手势管理
   - 手势防抖和节流
   - 优化变换计算

4. **可访问性优化**：

   - 添加可访问性标签
   - 支持键盘操作
   - 提供状态反馈

5. **错误处理优化**：
   - 统一的错误处理
   - 状态回滚机制
   - 错误边界处理

## 15. 模板系统实现

### 15.1 模板数据结构

```typescript
// 1. 模板基础接口
interface Template {
  id: string;
  name: string;
  thumbnail: string;
  category: TemplateCategory;
  elements: TemplateElement[];
  layout: TemplateLayout;
  style: TemplateStyle;
}

// 2. 模板元素
interface TemplateElement {
  id: string;
  type: 'image' | 'text' | 'shape' | 'sticker';
  position: {x: number; y: number};
  size: {width: number; height: number};
  style: ElementStyle;
  content?: string;
  resource_url?: string;
}

// 3. 模板布局
interface TemplateLayout {
  type: 'grid' | 'collage' | 'single';
  rows?: number;
  columns?: number;
  spacing?: number;
  aspectRatio?: number;
  padding?: number;
}

// 4. 模板样式
interface TemplateStyle {
  background: {
    type: 'color' | 'gradient' | 'image';
    value: string;
  };
  border?: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
  shadow?: {
    color: string;
    blur: number;
    offset: {x: number; y: number};
  };
}
```

### 15.2 模板渲染器

```typescript
// 1. 模板渲染器组件
const TemplateRenderer: FC<{template: Template}> = ({template}) => {
  // 计算实际尺寸和位置
  const {width, height} = useWindowDimensions();
  const scale = Math.min(
    width / template.layout.width,
    height / template.layout.height,
  );

  return (
    <View style={styles.container}>
      {/* 背景层 */}
      <TemplateBackground style={template.style.background} />

      {/* 元素层 */}
      <View style={styles.elementsContainer}>
        {template.elements.map(element => (
          <TemplateElement key={element.id} element={element} scale={scale} />
        ))}
      </View>

      {/* 边框层 */}
      {template.style.border && (
        <TemplateBorder style={template.style.border} />
      )}
    </View>
  );
};

// 2. 模板元素渲染
const TemplateElement: FC<{
  element: TemplateElement;
  scale: number;
}> = ({element, scale}) => {
  const {position, size, style} = element;

  const elementStyle = {
    position: 'absolute',
    left: position.x * scale,
    top: position.y * scale,
    width: size.width * scale,
    height: size.height * scale,
    ...style,
  };

  switch (element.type) {
    case 'image':
      return (
        <Image source={{uri: element.resource_url}} style={elementStyle} />
      );
    case 'text':
      return <Text style={elementStyle}>{element.content}</Text>;
    case 'shape':
      return <ShapeRenderer style={elementStyle} />;
    case 'sticker':
      return <StickerRenderer style={elementStyle} />;
    default:
      return null;
  }
};
```

### 15.3 模板编辑器

```typescript
// 1. 模板编辑器组件
const TemplateEditor: FC<{
  template: Template;
  onSave: (template: Template) => void;
}> = ({template, onSave}) => {
  const [editingTemplate, setEditingTemplate] = useState(template);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // 元素编辑处理
  const handleElementEdit = useCallback(
    (elementId: string, changes: Partial<TemplateElement>) => {
      setEditingTemplate(prev => ({
        ...prev,
        elements: prev.elements.map(el =>
          el.id === elementId ? {...el, ...changes} : el,
        ),
      }));
    },
    [],
  );

  // 布局编辑处理
  const handleLayoutEdit = useCallback((changes: Partial<TemplateLayout>) => {
    setEditingTemplate(prev => ({
      ...prev,
      layout: {...prev.layout, ...changes},
    }));
  }, []);

  // 样式编辑处理
  const handleStyleEdit = useCallback((changes: Partial<TemplateStyle>) => {
    setEditingTemplate(prev => ({
      ...prev,
      style: {...prev.style, ...changes},
    }));
  }, []);

  return (
    <View style={styles.container}>
      {/* 预览区域 */}
      <TemplateRenderer template={editingTemplate} />

      {/* 工具栏 */}
      <TemplateToolbar
        onAddElement={handleAddElement}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* 属性编辑器 */}
      {selectedElement ? (
        <ElementPropertyEditor
          element={editingTemplate.elements.find(
            el => el.id === selectedElement,
          )}
          onChange={changes => handleElementEdit(selectedElement, changes)}
        />
      ) : (
        <TemplatePropertyEditor
          template={editingTemplate}
          onLayoutChange={handleLayoutEdit}
          onStyleChange={handleStyleEdit}
        />
      )}

      {/* 保存按钮 */}
      <Button title="保存模板" onPress={() => onSave(editingTemplate)} />
    </View>
  );
};

// 2. 元素属性编辑器
const ElementPropertyEditor: FC<{
  element: TemplateElement;
  onChange: (changes: Partial<TemplateElement>) => void;
}> = ({element, onChange}) => {
  return (
    <View style={styles.propertyEditor}>
      {/* 位置编辑 */}
      <PositionEditor
        position={element.position}
        onChange={position => onChange({position})}
      />

      {/* 尺寸编辑 */}
      <SizeEditor size={element.size} onChange={size => onChange({size})} />

      {/* 样式编辑 */}
      <StyleEditor
        style={element.style}
        onChange={style => onChange({style})}
      />

      {/* 内容编辑（根据元素类型） */}
      {element.type === 'text' && (
        <TextEditor
          content={element.content}
          onChange={content => onChange({content})}
        />
      )}
    </View>
  );
};
```

### 15.4 模板管理系统

```typescript
// 1. 模板管理器
class TemplateManager {
  private templates: Map<string, Template> = new Map();
  private categories: TemplateCategory[] = [];

  // 添加模板
  addTemplate(template: Template) {
    this.templates.set(template.id, template);
    this.updateCategories();
  }

  // 获取模板
  getTemplate(id: string): Template | undefined {
    return this.templates.get(id);
  }

  // 更新模板
  updateTemplate(id: string, changes: Partial<Template>) {
    const template = this.templates.get(id);
    if (template) {
      this.templates.set(id, {...template, ...changes});
    }
  }

  // 删除模板
  deleteTemplate(id: string) {
    this.templates.delete(id);
    this.updateCategories();
  }

  // 获取分类列表
  getCategories(): TemplateCategory[] {
    return this.categories;
  }

  // 获取分类下的模板
  getTemplatesByCategory(category: string): Template[] {
    return Array.from(this.templates.values()).filter(
      t => t.category === category,
    );
  }

  // 更新分类
  private updateCategories() {
    const categorySet = new Set<string>();
    this.templates.forEach(t => categorySet.add(t.category));
    this.categories = Array.from(categorySet);
  }
}

// 2. 模板选择器组件
const TemplateSelector: FC<{
  onSelect: (template: Template) => void;
}> = ({onSelect}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const templateManager = useContext(TemplateManagerContext);

  const categories = templateManager.getCategories();
  const templates = selectedCategory
    ? templateManager.getTemplatesByCategory(selectedCategory)
    : [];

  return (
    <View style={styles.container}>
      {/* 分类选择器 */}
      <ScrollView horizontal style={styles.categoryList}>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryItem,
              selectedCategory === category && styles.selectedCategory,
            ]}>
            <Text>{category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 模板列表 */}
      <FlashList
        data={templates}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => onSelect(item)}
            style={styles.templateItem}>
            <Image
              source={{uri: item.thumbnail}}
              style={styles.templateThumbnail}
            />
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
        estimatedItemSize={200}
        numColumns={2}
      />
    </View>
  );
};
```

### 15.5 样式定义

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  elementsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  propertyEditor: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  categoryList: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryItem: {
    padding: 12,
    marginHorizontal: 8,
  },
  selectedCategory: {
    borderBottomWidth: 2,
    borderBottomColor: mainColor,
  },
  templateItem: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  templateThumbnail: {
    width: '100%',
    aspectRatio: 1,
  },
});
```

### 15.6 使用示例

```typescript
// 1. 在编辑器中使用模板
const EditorHome: FC = () => {
  const templateManager = useTemplateManager();
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);

  const handleTemplateSelect = useCallback((template: Template) => {
    setCurrentTemplate(template);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {currentTemplate ? (
        <TemplateEditor
          template={currentTemplate}
          onSave={handleTemplateSave}
        />
      ) : (
        <TemplateSelector onSelect={handleTemplateSelect} />
      )}
    </SafeAreaView>
  );
};

// 2. 创建自定义模板
const createCustomTemplate = (): Template => ({
  id: generateUniqueId(),
  name: '自定义模板',
  thumbnail: '',
  category: 'custom',
  elements: [],
  layout: {
    type: 'grid',
    rows: 2,
    columns: 2,
    spacing: 8,
  },
  style: {
    background: {
      type: 'color',
      value: '#ffffff',
    },
  },
});
```

模板系统的主要特点：

1. **灵活的数据结构**

   - 支持多种元素类型
   - 可自定义布局和样式
   - 支持分类管理

2. **高性能渲染**

   - 使用 FlashList 优化长列表
   - 按需渲染模板元素
   - 缓存模板缩略图

3. **直观的编辑器**

   - 所见即所得的编辑体验
   - 支持实时预览
   - 完整的属性编辑功能

4. **可扩展性**

   - 支持自定义模板
   - 可扩展元素类型
   - 灵活的样式系统

5. **用户体验**
   - 分类浏览
   - 缩略图预览
   - 响应式布局

## 16. 优化后的模板系统实现

### 16.1 模板数据结构

```typescript
// 1. 基础模板接口
interface Template {
  id: string; // 模板唯一标识
  name: string; // 模板名称
  thumbnail: string; // 缩略图URL
  category: TemplateCategory; // 模板分类
  elements: TemplateElement[]; // 模板元素
  layout: TemplateLayout; // 布局配置
  style: TemplateStyle; // 样式配置
  version: string; // 版本号，用于模板更新
}

// 2. 模板元素定义
interface TemplateElement {
  id: string;
  type: 'image' | 'text' | 'shape' | 'sticker';
  position: {
    x: number;
    y: number;
    z: number; // z-index for layering
  };
  size: {
    width: number;
    height: number;
  };
  transform: {
    rotation: number;
    scale: number;
    flipX: boolean;
    flipY: boolean;
  };
  style: {
    opacity: number;
    blendMode: string;
    filters: Filter[];
    shadow?: Shadow;
    border?: Border;
  };
  constraints: {
    lockAspectRatio: boolean;
    minSize: {width: number; height: number};
    maxSize: {width: number; height: number};
  };
}
```

### 16.2 模板渲染实现

```typescript
const TemplateRenderer: FC<{template: Template}> = ({template}) => {
  // 1. 状态管理
  const [loadedResources, setLoadedResources] = useState<boolean>(false);
  const canvasRef = useRef<Canvas>(null);

  // 2. 资源预加载
  useEffect(() => {
    const loadResources = async () => {
      try {
        // 加载图片资源
        await Promise.all(
          template.elements
            .filter(el => el.type === 'image')
            .map(el => loadImage(el.resource_url)),
        );
        setLoadedResources(true);
      } catch (error) {
        console.error('Failed to load template resources:', error);
      }
    };

    loadResources();
  }, [template]);

  // 3. 渲染层级管理
  const renderLayers = useCallback(() => {
    if (!canvasRef.current || !loadedResources) return;

    const ctx = canvasRef.current.getContext('2d');

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 渲染背景
    renderBackground(ctx, template.style.background);

    // 按z-index排序并渲染元素
    const sortedElements = [...template.elements].sort(
      (a, b) => a.position.z - b.position.z,
    );

    // 渲染每个元素
    sortedElements.forEach(element => {
      ctx.save();

      // 应用变换
      applyElementTransform(ctx, element);

      // 应用样式
      applyElementStyle(ctx, element.style);

      // 根据元素类型渲染
      switch (element.type) {
        case 'image':
          renderImage(ctx, element);
          break;
        case 'text':
          renderText(ctx, element);
          break;
        case 'shape':
          renderShape(ctx, element);
          break;
        case 'sticker':
          renderSticker(ctx, element);
          break;
      }

      ctx.restore();
    });
  }, [template, loadedResources]);

  // 4. 元素渲染实现
  const renderImage = (
    ctx: CanvasRenderingContext2D,
    element: TemplateElement,
  ) => {
    const image = resourceCache.get(element.resource_url);
    if (!image) return;

    ctx.drawImage(
      image,
      element.position.x,
      element.position.y,
      element.size.width,
      element.size.height,
    );
  };

  // 5. 变换和样式应用
  const applyElementTransform = (
    ctx: CanvasRenderingContext2D,
    element: TemplateElement,
  ) => {
    const {position, transform} = element;

    ctx.translate(
      position.x + element.size.width / 2,
      position.y + element.size.height / 2,
    );
    ctx.rotate(transform.rotation);
    ctx.scale(
      transform.scale * (transform.flipX ? -1 : 1),
      transform.scale * (transform.flipY ? -1 : 1),
    );
    ctx.translate(
      -(position.x + element.size.width / 2),
      -(position.y + element.size.height / 2),
    );
  };

  // 6. 渲染循环
  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      renderLayers();
      animationFrame = requestAnimationFrame(animate);
    };

    if (loadedResources) {
      animate();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [renderLayers, loadedResources]);

  return <Canvas ref={canvasRef} style={[styles.canvas, template.style]} />;
};
```

### 16.3 模板编辑实现

```typescript
const TemplateEditor: FC<{template: Template}> = ({template}) => {
  // 1. 编辑状态管理
  const [editingState, setEditingState] = useState({
    selectedElement: null,
    draggedElement: null,
    scale: 1,
    isDragging: false,
  });

  // 2. 历史记录管理
  const [history, setHistory] = useState<Template[]>([template]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // 3. 元素操作处理
  const handleElementSelect = useCallback((elementId: string) => {
    setEditingState(prev => ({
      ...prev,
      selectedElement: elementId,
    }));
  }, []);

  const handleElementDrag = useCallback(
    (elementId: string, position: Position) => {
      updateTemplate(draft => {
        const element = draft.elements.find(el => el.id === elementId);
        if (element) {
          element.position = position;
        }
      });
    },
    [],
  );

  // 4. 历史记录处理
  const updateTemplate = useCallback(
    (updater: (draft: Template) => void) => {
      const newTemplate = produce(template, updater);

      // 添加到历史记录
      setHistory(prev => [...prev.slice(0, historyIndex + 1), newTemplate]);
      setHistoryIndex(prev => prev + 1);
    },
    [template, historyIndex],
  );

  // 5. 渲染编辑器UI
  return (
    <View style={styles.container}>
      <TemplateToolbar
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      <TemplateRenderer
        template={history[historyIndex]}
        selectedElement={editingState.selectedElement}
        onElementSelect={handleElementSelect}
        onElementDrag={handleElementDrag}
        onElementTransform={handleElementTransform}
      />

      {editingState.selectedElement && (
        <ElementPropertyPanel
          element={getSelectedElement()}
          onChange={handleElementPropertyChange}
        />
      )}
    </View>
  );
};
```

### 16.4 性能优化要点

1. **渲染优化**

   - 使用 Canvas 进行渲染
   - 分层渲染架构
   - 资源预加载和缓存
   - 选择性重渲染

2. **状态管理优化**

   - 使用 useCallback 优化事件处理
   - 使用 useRef 避免不必要的重渲染
   - 分离编辑状态和历史记录状态

3. **资源管理优化**

   - 图片资源预加载
   - 资源缓存机制
   - 异步加载处理

4. **交互优化**

   - 平滑的动画效果
   - 即时的用户反馈
   - 完整的历史记录支持

5. **内存优化**
   - 及时清理不需要的资源
   - 优化渲染循环
   - 控制历史记录大小

## 7. Template 优化实现

### 7.1 统一图层数据结构

```typescript
interface Layer {
  id: string; // 图层唯一标识
  type: LayerType; // 图层类型
  content: LayerContent; // 图层内容
  transform: Transform; // 变换信息
  filter?: FilterType; // 滤镜效果
  blendMode: BlendMode; // 混合模式
  visible: boolean; // 可见性
  zIndex: number; // 层级
  moveable: boolean; // 是否可移动
}

// 模板专用图层内容
interface TemplateLayerContent extends LayerContent {
  image: SkImage; // 图层图片
  combine_layer_type?: TemplateCombineLayerType; // 组合类型
  ref_dimensions?: {
    // 参考尺寸
    width: number;
    height: number;
  };
}
```

### 7.2 模板转换系统

```typescript
function convertTemplateToLayers(
  templateAssets: Editor.TemplateAssetsInfo,
): Layer[] {
  const layers: Layer[] = [];

  // 1. 添加背景图层
  if (templateAssets.primate_template_image_key) {
    layers.push({
      id: 'template_background',
      type: 'template_background',
      content: {
        image: templateAssets.primate_template_image_key,
        combine_layer_type: TemplateCombineLayerType.remote_cloud_image,
      },
      transform: {
        translate: [0, 0],
        scale: [1, 1],
        rotate: 0,
      },
      blendMode: 'normal',
      visible: true,
      zIndex: 0,
      moveable: false,
    });
  }

  // 2. 添加模板图层
  templateAssets.assets?.forEach((asset, index) => {
    layers.push({
      id: uuid.v4(),
      type: 'template_layer',
      content: {
        image: asset.layer_key,
        combine_layer_type: asset.combine_layer_type,
        ref_dimensions: {
          width: asset.ref_width,
          height: asset.ref_height,
        },
      },
      transform: {
        translate: [asset.layer_x_pos, asset.layer_y_pos],
        scale: [
          asset.layer_width / asset.ref_width,
          asset.layer_height / asset.ref_height,
        ],
        rotate: asset.rotate,
      },
      filter: asset.filter_type,
      blendMode: 'normal',
      visible: true,
      zIndex: index + 1,
      moveable: asset.moveable,
    });
  });

  return layers;
}
```

### 7.3 统一渲染系统

```typescript
// 1. 模板图层渲染器
function TemplateLayerRenderer({layer}: {layer: Layer}) {
  const {content, transform, filter} = layer;

  return (
    <Group transform={transform} origin={{x: 0, y: 0}}>
      {filter ? (
        <Image
          image={content.image}
          fit="cover"
          x={0}
          y={0}
          width={content.ref_dimensions.width}
          height={content.ref_dimensions.height}>
          {renderFilter(filter)}
        </Image>
      ) : (
        <Image
          image={content.image}
          fit="cover"
          x={0}
          y={0}
          width={content.ref_dimensions.width}
          height={content.ref_dimensions.height}
        />
      )}
    </Group>
  );
}

// 2. 主Canvas组件
function EditorCanvas() {
  const {layers, template} = useSelector(state => state.editor);

  return (
    <Canvas style={styles.canvas}>
      <Group>
        {layers
          .sort((a, b) => a.zIndex - b.zIndex)
          .map(layer => (
            <LayerGestureHandler key={layer.id} layer={layer}>
              {layer.type === 'template_layer' ? (
                <TemplateLayerRenderer layer={layer} />
              ) : (
                <DefaultLayerRenderer layer={layer} />
              )}
            </LayerGestureHandler>
          ))}
      </Group>
    </Canvas>
  );
}
```

### 7.4 统一状态管理

```typescript
// 1. 状态定义
interface EditorState {
  layers: Layer[];
  activeLayer: string | null;
  template: {
    isActive: boolean;
    assets: Editor.TemplateAssetsInfo | null;
    dimensions: {
      width: number;
      height: number;
    };
  };
}

// 2. Redux reducer
const editorReducer = {
  setTemplate(state: EditorState, templateAssets: Editor.TemplateAssetsInfo) {
    const layers = convertTemplateToLayers(templateAssets);
    return {
      ...state,
      layers,
      template: {
        isActive: true,
        assets: templateAssets,
        dimensions: {
          width: templateAssets.template_width,
          height: templateAssets.template_height,
        },
      },
    };
  },

  updateLayer(state: EditorState, {layerId, updates}) {
    return {
      ...state,
      layers: state.layers.map(layer =>
        layer.id === layerId ? {...layer, ...updates} : layer,
      ),
    };
  },
};
```

### 7.5 手势处理系统

```typescript
function LayerGestureHandler({
  layer,
  children,
}: {
  layer: Layer;
  children: React.ReactNode;
}) {
  if (!layer.moveable) {
    return <>{children}</>;
  }

  return (
    <GestureWrapper
      useAnimated={true}
      onOffsetChange={offset =>
        updateLayerTransform(layer.id, 'translate', offset)
      }
      onScaleChange={scale => updateLayerTransform(layer.id, 'scale', scale)}
      onRotateChange={rotate =>
        updateLayerTransform(layer.id, 'rotate', rotate)
      }>
      {children}
    </GestureWrapper>
  );
}
```

### 7.6 性能优化策略

1. **资源预加载**

```typescript
async function preloadTemplateResources(
  templateAssets: Editor.TemplateAssetsInfo,
) {
  const imagePromises = [
    loadImage(templateAssets.primate_template_image_key),
    ...templateAssets.assets
      .map(asset => (asset.layer_key ? loadImage(asset.layer_key) : null))
      .filter(Boolean),
  ];

  return Promise.all(imagePromises);
}
```

2. **渲染优化**

```typescript
// 使用React.memo优化图层渲染
const MemoizedTemplateLayer = React.memo(
  TemplateLayerRenderer,
  (prevProps, nextProps) => {
    return (
      prevProps.layer.content.image === nextProps.layer.content.image &&
      prevProps.layer.transform === nextProps.layer.transform &&
      prevProps.layer.filter === nextProps.layer.filter
    );
  },
);
```

3. **状态更新优化**

```typescript
function batchUpdateLayers(updates: LayerUpdate[]) {
  return {
    type: 'BATCH_UPDATE_LAYERS',
    payload: updates,
  };
}
```

### 7.7 实现优势

1. **统一性**

   - 所有图层使用统一的数据结构
   - 统一的状态管理和更新机制
   - 一致的用户交互体验

2. **可扩展性**

   - 易于添加新的图层类型
   - 支持自定义渲染器
   - 灵活的滤镜和效果系统

3. **性能优化**

   - 单一 Canvas 实例
   - 资源预加载
   - 渲染优化
   - 批量状态更新

4. **维护性**
   - 清晰的代码结构
   - 集中的状态管理
   - 模块化的设计
