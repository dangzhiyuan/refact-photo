# 新的图层架构与手势系统

## 一、图层架构概述

新的图层架构旨在提供更清晰、灵活和高效的图层管理和渲染机制。通过分离状态管理和渲染逻辑，解决了之前架构中的多个缺点。

### 1. 核心组件

- **Layer**: 定义不同类型的图层（如图片、文本、绘制、滤镜），每种图层都有自己的属性和方法。
- **LayerStateStore**: 使用 Zustand 管理图层的状态，包括图层的增删改查、选中状态等。
- **LayerRendererStore**: 管理图层渲染器的注册和获取，支持不同类型图层的渲染。
- **LayerRenderer**: 负责渲染不同类型的图层，使用 React 组件来实现。

### 2. 主要类型定义

- **LayerType**: 定义图层的类型（如 "image"、"text"、"draw"、"filter"）。
- **BaseLayer**: 所有图层的基础属性，包括 ID、名称、可见性、透明度、混合模式、变换和 zIndex。
- **具体图层类型**: 如 `ImageLayer`、`TextLayer`、`DrawLayer` 和 `FilterLayer`，每种类型都有特定的属性。

### 示例代码

```typescript
// types/layer.ts
export type LayerType = "image" | "text" | "draw" | "filter";

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  isVisible: boolean;
  opacity: number;
  blendMode: BlendMode;
  transform: Transform;
  zIndex: number;
}

export interface ImageLayer extends BaseLayer {
  type: "image";
  imageSource: SkImage;
  filterType: LutType;
  adjustments: Adjustments;
}

export interface TextLayer extends BaseLayer {
  type: "text";
  text: string;
  fontSize: number;
  color: string;
}

export interface DrawLayer extends BaseLayer {
  type: "draw";
  paths: SkPath[];
  color: string;
  strokeWidth: number;
}
```

## 二、优点

1. **清晰的职责分离**:

   - 状态管理和渲染逻辑分开，使得代码更易于维护和扩展。
   - 每个组件和模块都有明确的职责，降低了耦合度。

2. **类型安全**:

   - 使用 TypeScript 定义类型，确保在开发过程中能够捕获类型错误，减少运行时错误。

3. **更好的性能**:

   - 使用 Map 数据结构来管理图层，提供更快的查找和更新性能。
   - 通过 React.memo 和其他优化手段减少不必要的重渲染。

4. **灵活的渲染机制**:

   - 通过注册渲染器的方式，可以轻松扩展新的图层类型和渲染逻辑。
   - 支持动态添加和移除图层，增强了灵活性。

5. **易于测试**:
   - 由于职责分离，单元测试和集成测试变得更加简单。
   - 可以独立测试状态管理和渲染逻辑。

## 三、手势系统

新的图层架构支持为每种图层类型独立配置手势处理逻辑，解决了之前图层分别添加不同手势的问题。

### 1. 手势管理的分离

在新的架构中，我们可以将手势管理逻辑与图层渲染逻辑分开。每个图层可以独立地定义其手势处理逻辑，而不必依赖于全局的手势管理。

### 2. 使用自定义 Hook

为每种图层类型创建自定义的手势处理 Hook，例如 `useImageLayerGestures`、`useTextLayerGestures` 和 `useDrawLayerGestures`。这些 Hook 可以根据图层的特性来处理手势事件。

```typescript
// hooks/canvas/useImageLayerGestures.ts
import { Gesture } from "react-native-gesture-handler";
import { useLayerStore } from "../../store/useLayerStore";

export const useImageLayerGestures = (layerId: string) => {
  const { updateLayer } = useLayerStore();

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      // 处理手势开始
    })
    .onUpdate((e) => {
      // 处理手势更新
      updateLayer(layerId, {
        transform: {
          position: {
            x: e.translationX,
            y: e.translationY,
          },
        },
      });
    });

  return { gesture };
};
```

### 3. 在 LayerFactory 中集成手势

在 `LayerFactory` 组件中，我们可以根据图层类型调用相应的手势 Hook，并将手势传递给渲染器。

```typescript
// features/canvas/layers/LayerFactory.tsx
const renderLayer = () => {
  switch (layer.type) {
    case "image":
      const { gesture: imageGesture } = useImageLayerGestures(layer.id);
      return (
        <GestureDetector gesture={imageGesture}>
          <ImageLayerRenderer layer={layer} isSelected={isSelected} />
        </GestureDetector>
      );
    case "text":
      const { gesture: textGesture } = useTextLayerGestures(layer.id);
      return (
        <GestureDetector gesture={textGesture}>
          <TextLayerRenderer layer={layer} isSelected={isSelected} />
        </GestureDetector>
      );
    case "draw":
      const { gesture: drawGesture } = useDrawLayerGestures(layer.id);
      return (
        <GestureDetector gesture={drawGesture}>
          <DrawLayerRenderer layer={layer} isSelected={isSelected} />
        </GestureDetector>
      );
    default:
      return null;
  }
};
```

### 4. 灵活的手势配置

通过这种方式，我们可以为每种图层类型配置不同的手势处理逻辑。例如，图像图层可以支持平移和缩放手势，而文本图层可能只需要选择手势。这样可以根据具体需求灵活配置手势。

### 5. 避免手势冲突

由于每个图层都有自己的手势处理逻辑，我们可以更好地管理手势冲突。例如，如果一个图层正在处理平移手势，其他图层可以选择忽略该手势，从而避免冲突。

## 四、需要调整的部分

1. **LUT 资源管理**:

   - 确保 LUT 资源的路径和类型定义一致，避免在使用时出现错误。
   - 需要在图层中添加对 LUT 的引用和处理逻辑。

2. **组件结构**:

   - 确保所有图层渲染器（如 `ImageLayerRenderer`、`TextLayerRenderer` 和 `DrawLayerRenderer`）都已正确实现并导出。
   - 在 `LayerRendererStore` 中注册这些渲染器。

3. **手势处理**:

   - 确保每个图层类型都有对应的手势处理 Hook，并在 `LayerFactory` 中正确集成。

4. **测试和验证**:
   - 在实现后进行全面测试，确保所有功能正常工作，特别是手势交互和图层渲染。

## 五、总结

新的图层架构通过清晰的职责分离、类型安全、性能优化和灵活的手势管理，解决了之前架构的多个缺点。它为未来的扩展和维护提供了良好的基础，同时增强了用户交互体验。
