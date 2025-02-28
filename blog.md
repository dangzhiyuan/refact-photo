# React Native 图片自适应最佳实践 - 从问题到解决方案

## 背景

在使用 React Native 和 Skia 开发图像编辑应用时，我们遇到了一个常见但棘手的问题：**如何正确处理不同尺寸图片的导入和显示**。特别是当用户导入大尺寸图片时，如何确保图片以合适的大小显示，并且居中于画布？

这个问题看似简单，但实际解决过程中涉及多个方面的考量：

- 性能优化 - 避免显示过大的图片导致性能问题
- 用户体验 - 确保导入的图片立即可见且位置合适
- 交互设计 - 支持用户后续的缩放和位置调整
- 代码可维护性 - 提供一个可复用的解决方案

## 问题分析

### 初始症状

当我们第一次实现图片导入功能时，发现导入的图片有以下问题：

1. **尺寸不合适** - 图片以原始大小显示，可能非常大或非常小
2. **位置不正确** - 图片没有居中显示，可能只显示一角或甚至在可视区域外
3. **后续交互困难** - 用户需要手动调整图片才能开始编辑

### 初步解决尝试

最初，我们尝试使用简单的方法解决这个问题：

```typescript
// 初始尝试：在创建图层时设置固定的缩放值
const scale = 0.5; // 硬编码的缩放值
```

这种方法很快显露出局限性：

- 对于不同尺寸的图片，固定的缩放值效果差异很大
- 没有考虑到画布大小与图片尺寸的比例关系
- 无法保证图片总是居中且适合显示

## 解决方案演进

### 方案 1：基于画布比例的缩放计算

我们第一个改进的方案是引入`calculateFitSize`函数：

```typescript
// 计算适应屏幕的尺寸
export const calculateFitSize = (
  imageWidth: number,
  imageHeight: number
): Size => {
  const canvasWidth = CANVAS_AREA.width;
  const canvasHeight = CANVAS_AREA.height;

  // 计算宽高比
  const imageRatio = imageWidth / imageHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let finalWidth: number;
  let finalHeight: number;

  if (imageRatio > canvasRatio) {
    // 图片更宽，以画布宽度为准
    finalWidth = canvasWidth * 0.8; // 留出一些边距
    finalHeight = finalWidth / imageRatio;
  } else {
    // 图片更高，以画布高度为准
    finalHeight = canvasHeight * 0.8; // 留出一些边距
    finalWidth = finalHeight * imageRatio;
  }

  return {
    width: finalWidth,
    height: finalHeight,
  };
};
```

这个函数考虑了画布和图片的宽高比，计算出适合显示的尺寸。但我们很快发现了新问题：

- 渲染组件和图层创建存在不一致，导致缩放比例未正确应用
- 大图片仍然可能以原始尺寸显示，超出屏幕

### 方案 2：渲染时强制缩放

为了解决渲染不一致问题，我们尝试在渲染组件中添加"紧急缩放"逻辑：

```typescript
// 在ImageLayerComponent中添加紧急缩放逻辑
if (originalWidth > 1000 || originalHeight > 1000) {
  // 计算合适的缩放比例
  const widthRatio = (canvasWidth * 0.8) / originalWidth;
  const heightRatio = (canvasHeight * 0.8) / originalHeight;
  const fitScale = Math.min(widthRatio, heightRatio);

  // 如果默认缩放接近1，应用计算的缩放值
  if (Math.abs(effectiveScale - 1.0) < 0.1) {
    effectiveScale = fitScale;
    // 同时调整位置使图片居中
    // ...
  }
}
```

这种方法有效解决了大图片问题，但代码变得复杂，且逻辑分散在多个地方。

### 最终方案：封装统一的图片变换计算

最终，我们设计了一个专门的函数`calculateImageTransform`，统一处理图片的缩放和位置计算：

```typescript
/**
 * 为图像计算适当的缩放和位置
 */
export const calculateImageTransform = (
  imageWidth: number,
  imageHeight: number,
  currentScale: number = 1.0,
  currentPosition: { x: number; y: number } = { x: 0, y: 0 }
) => {
  // 获取画布尺寸
  const canvasWidth = CANVAS_AREA.width;
  const canvasHeight = CANVAS_AREA.height;

  // 初始化返回值
  let scale = currentScale;
  let position = { ...currentPosition };
  let isAdjusted = false;

  // 检查是否需要调整尺寸
  const needsScaling = imageWidth > 1000 || imageHeight > 1000;
  const isDefaultScale = Math.abs(currentScale - 1.0) < 0.1;

  if (needsScaling && isDefaultScale) {
    // 计算合适的缩放比例
    const widthRatio = (canvasWidth * 0.8) / imageWidth;
    const heightRatio = (canvasHeight * 0.8) / imageHeight;
    scale = Math.min(widthRatio, heightRatio);
    isAdjusted = true;

    // 根据新的缩放计算居中位置
    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    position = {
      x: centerX - scaledWidth / 2,
      y: centerY - scaledHeight / 2,
    };
  }

  return {
    scale,
    position,
    isAdjusted,
  };
};
```

然后在图层创建时应用：

```typescript
// 创建图像图层
export const createImageLayer = (
  imageSource: SkImage,
  name = "图片"
): ImageLayer => {
  const imageWidth = imageSource.width();
  const imageHeight = imageSource.height();

  // 使用工具函数计算缩放和位置
  const { scale, position } = calculateImageTransform(imageWidth, imageHeight);

  return {
    // ... 其他图层属性
    transform: {
      position,
      scale,
      rotation: 0,
    },
    // ...
  };
};
```

在渲染组件中也使用同样的函数：

```typescript
export const ImageLayerComponent: React.FC<ImageLayerProps> = ({
  layer,
  isSelected,
}) => {
  const { imageSource, transform, opacity, isVisible } = layer;

  if (!isVisible) return null;

  // 使用工具函数计算合适的缩放和位置
  const adjustedTransform = useMemo(() => {
    return calculateImageTransform(
      imageSource.width(),
      imageSource.height(),
      transform.scale,
      transform.position
    );
  }, [imageSource, transform.scale, transform.position]);

  // 计算最终渲染尺寸
  const width = imageSource.width() * adjustedTransform.scale;
  const height = imageSource.height() * adjustedTransform.scale;

  // 获取渲染位置（优先使用调整后的位置）
  const position = adjustedTransform.isAdjusted
    ? adjustedTransform.position
    : transform.position;

  return (
    <Group
      transform={[
        { translateX: position.x },
        { translateY: position.y },
        { rotate: transform.rotation },
      ]}
      opacity={opacity}
    >
      <Image image={imageSource} width={width} height={height} fit="contain" />
    </Group>
  );
};
```

## 核心优势和经验总结

通过这个解决方案，我们获得了以下优势：

1. **一致的初始显示** - 图片总是以合适的大小显示在画布中心
2. **智能的缩放逻辑** - 只有大尺寸图片且未经用户调整时才应用自动缩放
3. **无缝的用户体验** - 导入后立即可以开始编辑，不需要手动调整
4. **代码可维护性** - 封装的函数使逻辑集中，易于修改和测试

## 经验教训和最佳实践

1. **封装复杂的布局逻辑**

   - 将复杂的布局计算逻辑封装为独立的工具函数
   - 使函数足够通用，支持不同的使用场景

2. **考虑初始状态与用户交互的平衡**

   - 初始状态应该合理但不干扰用户的自定义意图
   - 使用条件判断（如`isDefaultScale`）来决定是否应用自动调整

3. **组件设计中的"智能默认值"**

   - 提供合理的默认行为，但允许覆盖
   - 使用诸如`isAdjusted`这样的标志来标识自动调整的情况

4. **性能优化**
   - 使用`useMemo`缓存计算结果，避免不必要的重新计算
   - 只在真正需要时执行复杂计算（条件判断）

通过这些实践，我们不仅解决了当前的图片显示问题，还建立了一套可复用的模式，用于处理类似的 UI 适配挑战。

## 下一步改进

虽然当前解决方案已经满足基本需求，但仍有改进空间：

1. **支持更多图片类型** - 根据不同的图片类型选择不同的缩放策略
2. **记忆用户偏好** - 记住用户对特定类型图片的缩放偏好
3. **动画过渡** - 添加平滑的动画，使自动缩放和居中更加自然

## 修复滤镜应用后图片位置和大小不一致问题

### 问题描述

在实现滤镜功能时，我们发现当用户在原始图片和滤镜图层之间切换时，图片的位置和大小会发生变化。具体表现为:

- 应用滤镜后，图片会移动到画布左侧而不保持在中心位置
- 滤镜应用后图片尺寸与原图不一致
- 从滤镜切换回原图时，位置又会再次变化

### 问题分析

经过调试和代码分析，我们发现问题出在 ImageLayer 和 FilterLayer 两个组件使用了不同的定位和缩放逻辑:

1. **双重缩放问题**:

   - FilterLayer 组件在计算 width/height 时已应用了缩放，但在 Group 的 transform 中又再次应用了 scale
   - 这导致缩放被应用了两次，使滤镜图像比原图大

2. **位置计算差异**:

   - 两个组件使用了不同的方法来确定渲染位置
   - 原图使用了居中逻辑，滤镜没有正确应用相同的逻辑

3. **变换逻辑不一致**:
   - 创建滤镜图层时使用的是重新计算的变换参数，而不是保留原图层的精确变换

### 解决方案

我们采取了以下步骤来解决这个问题:

1. **统一变换计算**:

   - 确保两个组件都使用相同的 `calculateImageTransform` 函数来计算位置和缩放
   - 在 FilterLayer 组件中使用与 ImageLayer 完全相同的变换逻辑

2. **避免双重缩放**:

   - 修改 FilterLayer 组件，确保缩放只应用一次:
     - 在计算图像尺寸时应用缩放
     - 从 Group 的 transform 中移除缩放变换

3. **保留原始变换**:
   - 在图层转换时准确地传递原始的变换信息:
   ```typescript
   const filterLayer = createFilterLayer(
     imageLayer.imageSource,
     type,
     `${imageLayer.name} 滤镜`,
     imageLayer.transform // 直接传入原图层的变换信息
   );
   ```

### 技术要点与最佳实践

这个问题揭示了处理图形变换时的几个重要原则:

1. **变换一致性**:

   - 相关组件之间应使用相同的变换计算和应用逻辑
   - 任何变换链中的微小差异都会导致明显的视觉不一致

2. **避免变换重叠**:

   - 在嵌套的组件结构中，要明确变换的应用位置
   - 小心避免在多个地方重复应用相同的变换

3. **传递与保留变换状态**:
   - 在组件或状态转换时，完整保留和传递变换信息至关重要
   - 用户期望对象在不同状态之间保持位置、大小和旋转角度的一致性

通过实施这些修改，我们成功解决了滤镜应用后的位置和大小不一致问题，在原图和滤镜效果之间切换时，现在图片能够保持完全相同的位置和尺寸，大大提升了用户体验。

---

希望这篇文章对你在 React Native 中处理图片显示问题有所帮助！

# 图层系统重构日志

## 2024-03-xx

### 一、完成的重构工作

1. **核心类型定义优化**

   - 重新设计了图层类型系统
   - 合并了 FilterLayer 到 ImageLayer
   - 优化了基础图层接口

2. **渲染器系统重构**

   - 实现了渲染器注册机制
   - 创建了专门的渲染器目录结构
   - 完成了三种主要渲染器：
     - ImageLayerRenderer
     - TextLayerRenderer
     - DrawLayerRenderer

3. **状态管理优化**
   - 使用 Zustand 管理图层状态
   - 实现了渲染器的动态注册机制
   - 优化了图层的增删改查操作

### 二、解决的主要问题

1. **代码组织问题**

   - 原先的渲染器分散在不同文件中
   - 渲染逻辑和状态管理混杂
   - 解决方案：创建统一的渲染器目录和注册机制

2. **类型系统问题**

   - 移除了冗余的 FilterLayer 类型
   - 将滤镜功能合并到 ImageLayer
   - 优化了图层属性的类型定义

3. **渲染器管理问题**
   - 实现了统一的渲染器注册机制
   - 使用 LayerFactory 统一管理渲染器
   - 提供了类型安全的渲染器查找

### 三、架构改进

1. **清晰的职责分离**

   ```
   app/features/canvas/layers/
   ├── LayerFactory.tsx       // 工厂组件
   ├── LayerRenderer.tsx      // 主渲染器
   ├── LayerRendererRegistry.tsx  // 渲染器注册
   └── renderers/             // 渲染器实现
       ├── ImageLayerRenderer.tsx
       ├── TextLayerRenderer.tsx
       └── DrawLayerRenderer.tsx
   ```

2. **状态管理优化**

   - 使用 Zustand 进行状态管理
   - 实现了渲染器的动态注册
   - 提供了类型安全的状态更新

3. **类型系统改进**
   - 统一了图层类型定义
   - 优化了渲染器属性类型
   - 提供了更好的类型推导

### 四、待完成工作

1. **手势系统实现**

   - 需要为每种图层类型创建专门的手势处理
   - 实现手势的动态注册机制
   - 处理手势冲突问题

2. **性能优化**

   - 添加必要的性能优化（如 React.memo）
   - 优化渲染器的重渲染逻辑
   - 实现更高效的状态更新

3. **测试系统**
   - 添加单元测试
   - 实现集成测试
   - 添加性能测试

### 五、经验总结

1. **架构设计**

   - 清晰的职责分离对于维护非常重要
   - 统一的注册机制提高了可扩展性
   - 类型系统的重要性

2. **重构策略**

   - 先完成核心功能，再添加新特性
   - 保持向后兼容性
   - 渐进式重构比一次性重写更可控

3. **下一步计划**
   - 实现手势系统
   - 添加错误边界
   - 优化性能
   - 完善测试

### 六、手势系统方案探索

在图层系统重构过程中，我们遇到了手势系统实现的挑战。主要问题是：在单 Canvas 架构下，如何为不同图层实现独立的手势控制。

1. **方案一：多 Canvas 架构**

   ```typescript
   // 每个图层使用独立的 Canvas
   <View>
     {layers.map(layer => (
       <GestureDetector key={layer.id} gesture={...}>
         <Canvas>
           <LayerRenderer layer={layer} />
         </Canvas>
       </GestureDetector>
     ))}
   </View>
   ```

   - 优点：手势控制灵活，每个图层可以有独立的手势
   - 缺点：性能开销大，多个 Canvas 的管理复杂

2. **方案二：Canvas 级别手势处理**

   - 在 Canvas 层监听所有手势
   - 根据触摸位置判断当前操作的图层
   - 通过状态管理分发手势事件
   - 优点：保持单 Canvas 的性能优势
   - 缺点：手势判断逻辑复杂

3. **方案三：分层手势处理**

   - 基础手势（缩放、平移）在 Canvas 层处理
   - 特殊手势（文字编辑、绘画）通过状态切换处理
   - 优点：逻辑清晰，易于维护
   - 缺点：可能存在手势冲突

4. **方案四：混合模式（当前选择）**
   - 普通操作使用单 Canvas
   - 特殊操作（如绘画）时临时切换到多 Canvas
   - 优点：
     - 平衡了性能和功能需求
     - 特殊操作时可以有更灵活的控制
   - 缺点：
     - 需要管理模式切换
     - 实现相对复杂

### 七、下一步计划

1. **实现混合模式手势系统**

   - [ ] 完善基础手势处理
   - [ ] 实现特殊操作的模式切换
   - [ ] 处理手势冲突

2. **性能优化**

   - [ ] 监控 Canvas 切换的性能影响
   - [ ] 优化渲染效率
   - [ ] 减少不必要的重渲染

3. **用户体验**
   - [ ] 确保模式切换的流畅性
   - [ ] 添加适当的视觉反馈
   - [ ] 处理边界情况

### 八、单 Canvas 架构的困境

在实现过程中，我们遇到了单 Canvas 架构的瓶颈：

1. **手势系统的限制**

   - GestureDetector 不能嵌套
   - 无法为单个 Group 添加独立手势
   - Canvas 级别的手势会影响所有图层

2. **尝试过的解决方案**

   ```typescript
   // 方案1：在 Group 中嵌套 GestureDetector
   <Canvas>
     <Group>
       <GestureDetector>  // ❌ 不起作用
         <Circle ... />
       </GestureDetector>
     </Group>
   </Canvas>

   // 方案2：组合手势
   const combinedGesture = Gesture.Simultaneous(
     gesture,
     Gesture.Pan()  // ❌ 导致系统崩溃
   );

   // 方案3：通过坐标判断
   const gesture = Gesture.Pan()
     .onTouchesDown((e) => {
       const touchedLayer = findLayerAtPoint(x, y);  // ❌ 实现复杂，不可靠
     });
   ```

3. **问题总结**
   - 手势系统与 Skia 的架构冲突
   - 无法实现真正独立的图层手势
   - 性能和可维护性难以平衡

### 九、新的架构方案

经过多次尝试，我们决定采用多 Canvas 方案：

1. **分层 Canvas 结构**

   ```typescript
   <View style={StyleSheet.absoluteFill}>
     {/* 1. 底层：图片图层 */}
     <Canvas style={StyleSheet.absoluteFill}>
       <ImageLayer />
     </Canvas>

     {/* 2. 中层：涂鸦图层 */}
     {isDrawMode && (
       <GestureDetector gesture={drawGesture}>
         <Canvas style={StyleSheet.absoluteFill}>
           <DrawLayer />
         </Canvas>
       </GestureDetector>
     )}

     {/* 3. 顶层：装饰图层 */}
     <GestureDetector gesture={decorationGesture}>
       <Canvas style={StyleSheet.absoluteFill}>
         <DecorationLayers />
       </Canvas>
     </GestureDetector>
   </View>
   ```

2. **新架构的优势**

   - 每个功能模块有独立的 Canvas
   - 手势处理清晰直观
   - 更好的性能控制
   - 更容易维护和扩展

3. **图层管理改进**
   - 按功能分类管理图层
   - 每类图层有专门的状态管理
   - 保持图层概念但简化实现

### 十、下一步计划

1. **重构任务**

   - [ ] 实现基础的多 Canvas 结构
   - [ ] 迁移现有的图片处理功能
   - [ ] 实现涂鸦系统
   - [ ] 添加装饰图层支持

2. **性能优化**

   - [ ] Canvas 按需创建和销毁
   - [ ] 使用 worklet 优化手势
   - [ ] 实现图层缓存机制

3. **功能测试**
   - [ ] 验证各个图层的独立性
   - [ ] 测试手势系统
   - [ ] 性能压力测试
