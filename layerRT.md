# 图层实时拖动问题解决方案：实现流畅的 React Native Skia 交互

## 1. 问题背景

### 用户体验问题描述

在我们的 React Native 图像编辑应用中，我们遇到了严重影响用户体验的问题：图层拖动时没有实时视觉反馈。具体表现为：

- **拖动无实时响应**：用户拖动图层时，图层位置保持静止，不会跟随手指移动
- **结束时突然跳跃**：只有在手指释放后，图层才会突然"跳"到新位置
- **拖动结束闪烁**：有时在拖动结束时图层会短暂闪烁，呈现不连续的视觉效果

这个问题严重降低了应用的专业性和可用性，尤其对于精确位置要求高的图像编辑应用来说是不可接受的。

### 预期行为与实际行为的差距

**预期行为**：

- 拖动图层时，图层应实时平滑地跟随手指移动
- 拖动过程中选择指示器也应同步移动
- 拖动结束时，图层应平滑过渡到最终位置，无视觉跳变

**实际行为**：

- 拖动过程中图层完全静止，没有移动
- 只有在松开手指后，图层才更新位置
- 拖动结束时经常出现短暂的闪烁或跳跃现象

用户必须通过想象或记忆来预测图层的目标位置，而不是通过实时反馈，这严重影响了定位精度和使用体验。

### 问题的技术影响范围

这个问题影响了应用的核心功能流程：

- **降低编辑精确度**：用户无法精确控制图层位置
- **减慢工作流程**：用户需要多次尝试才能放置图层到期望位置
- **增加认知负担**：用户需要在脑中想象而非直观看到结果
- **影响多种图层类型**：图像、文本和绘图图层都受到影响
- **破坏专业印象**：让应用看起来不完善和不专业

## 2. 原因分析

通过代码审查和测试，我们定位了几个关键的技术问题：

### 架构层面：渲染系统与手势系统脱节

我们的应用使用复杂的技术栈组合：

- `@shopify/react-native-skia` 负责高性能图形渲染
- `react-native-gesture-handler` 处理触摸手势
- `react-native-reanimated` 处理动画
- `zustand` 管理应用状态

核心问题在于**这些系统之间的连接断裂**。具体来说，当手势被检测到时，动画值会更新，但这些更新未能传递到 Skia 渲染系统：

```typescript
// LayerGestureHandler.tsx 中的问题代码
const panGesture = Gesture.Pan()
.onChange((e) => {
// 只更新本地动画值，但 Skia 渲染系统对此一无所知
translateX.value += e.changeX;
translateY.value += e.changeY;
// 缺少：未将这些变化传递给任何会触发 Skia 重新渲染的状态
})
.onEnd(() => {
console.log(LAYER ${layer.id} PAN ENDED);
// 只在拖动结束时更新图层状态
runOnJS(updateLayer)(layer.id, {
transform: {
...layer.transform,
position: {
x: translateX.value,
y: translateY.value,
},
},
});
});
```

这样的实现导致 Skia 渲染的图层只在手势完全结束时才会更新，而不是实时反映位置变化。

### 状态管理：临时位置未被正确传递到渲染系统

`useTempPositionStore` 用于存储拖动中的临时位置，要在 `LayerRenderer` 中集成，保证这些临时状态被集成到渲染流程中：

```typescript
// LayerRenderer.tsx 原始代码
export const LayerRenderer: FC = () => {
  // 获取所有图层并排序
  const layers = useLayerStore((state) => state.layers);
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const sortedLayers = useMemo(() => {
    return Array.from(layers.values()).sort((a, b) => a.zIndex - b.zIndex);
  }, [layers]);
  return (
    <Group>
      {sortedLayers.map((layer) => (
        <LayerFactory
          key={layer.id}
          layer={layer} // 只使用永久位置，完全忽略临时拖动位置
          isSelected={layer.id === selectedLayerId}
        />
      ))}
    </Group>
  );
};
```

这导致即使临时位置状态在拖动过程中被更新，Skia 渲染组件也无法访问这些状态变化。

### 依赖关系：组件订阅模式不正确

在 `LayerGestureManager` 中，我们发现了一个依赖项错误，导致组件无法正确响应图层变化：

```typescript
// LayerGestureManager.tsx 中的依赖项问题
export const LayerGestureManager: FC = () => {
  // 错误：使用 getState() 直接获取值，而非订阅状态
  const layers = useMemo(() => {
    const allLayers = useLayerStore.getState().layers;
    console.log("LayerGestureManager: Found", allLayers.size, "layers");
    return Array.from(allLayers.values()).sort((a, b) => b.zIndex - a.zIndex);
  }, [useLayerStore.getState().layers]); // 这个依赖项不会触发 useMemo 重新计算
  // ...其余代码
};
```

使用 `useLayerStore.getState().layers` 作为依赖项是错误的，因为 `getState()` 总是返回一个新的引用，不会触发重新计算。这意味着即使图层发生变化，手势处理器也不会更新。

### 状态更新时序：引起闪烁的状态转换问题

拖动结束时的闪烁是由状态更新顺序不当导致的：

```typescript
// 原始代码中的不良状态更新顺序
.onEnd(() => {
// 首先移除拖动状态标记
runOnJS(markLayerAsDragging)(layer.id, false);
// 然后更新永久位置
runOnJS(updateLayer)(layer.id, {
transform: {
...layer.transform,
position: {
x: translateX.value,
y: translateY.value,
},
},
});
});
```

这个顺序导致：

1. 首先移除临时位置 → 图层回到原始位置（第一次渲染）
2. 然后更新永久位置 → 图层移动到新位置（第二次渲染）

这两次渲染之间的视觉差异导致看到的闪烁。

## 3. 解决方案设计

我们设计了全面的解决方案，涉及多个系统层面的改进：

### 临时位置状态管理方案

为了实现实时拖动反馈，我们设计了一个完整的临时位置状态管理系统：

```typescript
// useTempPositionStore.ts
export const useTempPositionStore = create<TempPositionStore>((set, get) => ({
  // 存储临时位置的记录
  positions: {},

  // 跟踪哪些图层正在拖动
  draggingLayers: new Set<string>(),

  // 更新临时位置
  updatePosition: (id, x, y) =>
    set((state) => ({
      positions: {
        ...state.positions,
        [id]: { x, y },
      },
    })),

  // 标记图层的拖动状态
  markLayerAsDragging: (id: string, isDragging: boolean) =>
    set((state) => {
      const newDraggingLayers = new Set(state.draggingLayers);
      if (isDragging) {
        newDraggingLayers.add(id);
      } else {
        newDraggingLayers.delete(id);
      }
      return { draggingLayers: newDraggingLayers };
    }),

  // 处理拖动结束，延迟清除临时位置
  finishDragging: (id: string) => {
    try {
      set((state) => {
        const newDraggingLayers = new Set(state.draggingLayers);
        newDraggingLayers.delete(id);
        return { draggingLayers: newDraggingLayers };
      });

      // 延迟清除临时位置，确保平滑过渡
      setTimeout(() => {
        set((state) => {
          const newPositions = { ...state.positions };
          delete newPositions[id];
          return { positions: newPositions };
        });
      }, 50);
    } catch (error) {
      console.error("Error in finishDragging:", error);
    }
  },

  // 其他辅助方法...
}));
```

这个状态存储提供了：

- 拖动中图层的临时位置跟踪
- 图层拖动状态的管理
- 平滑过渡所需的延迟清理机制

### 渲染层与手势层的集成方案

我们重新设计了渲染系统和手势系统的连接：

1. **手势系统实时更新临时位置**：

```typescript
// LayerGestureHandler.tsx
.onChange((e) => {
  // 更新动画值
  translateX.value += e.changeX;
  translateY.value += e.changeY;

  // 关键改进：将位置变化传递给临时位置存储
  runOnJS(tempUpdateLayerPosition)(
    layer.id,
    translateX.value,
    translateY.value
  );
})
```

2. **渲染系统使用临时位置**：

```typescript
// LayerRenderer.tsx
export const LayerRenderer: FC = () => {
  // ...原有代码

  // 获取临时位置信息
  const tempPositions = useTempPositionStore((state) => state.positions);
  const draggingLayers = useTempPositionStore((state) => state.draggingLayers);

  return (
    <Group>
      {sortedLayers.map((layer) => {
        // 检查是否有临时位置以实现实时拖动效果
        const tempPosition = tempPositions[layer.id];
        const isDragging = draggingLayers.has(layer.id);

        // 如果正在拖动并且有临时位置，创建带有临时位置的图层副本
        const renderedLayer =
          isDragging && tempPosition
            ? {
                ...layer,
                transform: {
                  ...layer.transform,
                  position: tempPosition,
                },
              }
            : layer;

        return (
          <LayerFactory
            key={layer.id}
            layer={renderedLayer} // 使用可能包含临时位置的图层
            isSelected={layer.id === selectedLayerId}
          />
        );
      })}
    </Group>
  );
};
```

这种集成方式确保手势触发的位置变化能立即反映在渲染中。

### 选择指示器的优化

选择指示器也需要使用临时位置来实现实时跟随效果：

```typescript
// SelectionIndicator.tsx
export const SelectionIndicator: FC = () => {
  // ...原有代码

  // 新增：获取临时位置
  const tempPositions = useTempPositionStore((state) => state.positions);
  const isDragging = selectedLayerId
    ? useTempPositionStore((state) => state.draggingLayers.has(selectedLayerId))
    : false;

  // ...

  // 获取实际使用的位置（临时位置或永久位置）
  const effectivePosition =
    isDragging && tempPositions[selectedLayerId]
      ? tempPositions[selectedLayerId]
      : selectedLayer.transform.position;

  // 使用effectivePosition创建指示器样式
  const indicatorStyle = {
    // ...
    transform: [
      { translateX: effectivePosition.x - margin },
      { translateY: effectivePosition.y - margin },
      // ...其他变换
    ],
  };

  // ...
};
```

这确保了选择指示器能实时跟随被拖动的图层，提供连贯的视觉反馈。

### 拖动结束时的平滑过渡实现

为解决拖动结束时的闪烁问题，我们改变了状态更新顺序，并添加了延迟清理机制：

```typescript
// LayerGestureHandler.tsx
.onEnd(() => {
  // 获取当前的临时位置值
  const finalPosition = {
    x: translateX.value,
    y: translateY.value,
  };

  // 首先更新图层的实际位置
  runOnJS(updateLayer)(layer.id, {
    transform: {
      ...layer.transform,
      position: finalPosition,
    },
  });

  // 然后再标记图层结束拖动（确保位置已更新）
  runOnJS(markLayerAsDragging)(layer.id, false);
});
```

同时，在临时位置存储中延迟清除临时位置：

```typescript
finishDragging: (id: string) => {
  // 先移除拖动标记
  set((state) => {
    const newDraggingLayers = new Set(state.draggingLayers);
    newDraggingLayers.delete(id);
    return { draggingLayers: newDraggingLayers };
  });

  // 延迟清除临时位置，确保过渡平滑
  setTimeout(() => {
    set((state) => {
      const newPositions = { ...state.positions };
      delete newPositions[id];
      return { positions: newPositions };
    });
  }, 50);
};
```

这种方式确保了在永久位置更新后，临时位置仍然存在一小段时间，从而实现平滑过渡。

## 4. 实施细节

### LayerGestureHandler 的修改

以下是 `LayerGestureHandler` 的完整修改，实现实时拖动反馈：

```typescript
// app/features/gestures/LayerGestureHandler.tsx
import React, { FC, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import { Layer } from "../../types/layer";
import { useLayerStore } from "../../store/useLayerStore";
import { calculateLayerDimensions } from "../../utils/layerUtils";
import {
  tempUpdateLayerPosition,
  markLayerAsDragging,
} from "../../store/useTempPositionStore";

interface LayerGestureHandlerProps {
  layer: Layer;
}

export const LayerGestureHandler: FC<LayerGestureHandlerProps> = ({
  layer,
}) => {
  const { selectLayer, updateLayer } = useLayerStore();
  const { width, height } = calculateLayerDimensions(layer);

  // 创建动画值
  const translateX = useSharedValue(layer.transform.position.x);
  const translateY = useSharedValue(layer.transform.position.y);

  // 当图层位置在状态中更新时，同步到动画值
  useEffect(() => {
    translateX.value = layer.transform.position.x;
    translateY.value = layer.transform.position.y;
  }, [layer.transform.position.x, layer.transform.position.y]);

  // 手势处理
  const panGesture = Gesture.Pan()
    .onStart(() => {
      console.log(`LAYER ${layer.id} PAN STARTED`);
      runOnJS(selectLayer)(layer.id);
      // 标记图层开始拖动
      runOnJS(markLayerAsDragging)(layer.id, true);
    })
    .onChange((e) => {
      // 更新动画值
      translateX.value += e.changeX;
      translateY.value += e.changeY;

      // 关键改进：更新临时位置以实时反映在渲染中
      runOnJS(tempUpdateLayerPosition)(
        layer.id,
        translateX.value,
        translateY.value
      );
    })
    .onEnd(() => {
      console.log(`LAYER ${layer.id} PAN ENDED`);

      // 获取当前的临时位置值
      const finalPosition = {
        x: translateX.value,
        y: translateY.value,
      };

      // 首先更新图层的实际位置（不会立即触发渲染）
      runOnJS(updateLayer)(layer.id, {
        transform: {
          ...layer.transform,
          position: finalPosition,
        },
      });

      // 然后再标记图层结束拖动（确保位置已更新）
      runOnJS(markLayerAsDragging)(layer.id, false);
    });

  // 创建动画样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      width: width,
      height: height,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.gestureArea, animatedStyle]}>
        <Text style={styles.layerLabel}>{layer.id.substring(0, 4)}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  gestureArea: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
    position: "absolute",
  },
  layerLabel: {
    color: "white",
    fontSize: 10,
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
});
```

主要改进点：

1. 添加 `tempUpdateLayerPosition` 实时更新临时位置
2. 修改拖动结束时状态更新顺序，先更新永久位置，再标记拖动结束
3. 在手势开始时标记图层为拖动状态

### LayerRenderer 的改进

以下是 `LayerRenderer` 的完整修改，使渲染系统能够使用临时位置：

```typescript
// app/features/canvas/layers/LayerRenderer.tsx
import React, { FC, useMemo } from "react";
import { Group } from "@shopify/react-native-skia";
import { useLayerStore } from "../../../store/useLayerStore";
import { LayerFactory } from "./LayerFactory";
import { useTempPositionStore } from "../../../store/useTempPositionStore";

export const LayerRenderer: FC = () => {
  // 获取所有图层并排序
  const layers = useLayerStore((state) => state.layers);
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);

  // 获取临时位置信息
  const tempPositions = useTempPositionStore((state) => state.positions);
  const draggingLayers = useTempPositionStore((state) => state.draggingLayers);

  const sortedLayers = useMemo(() => {
    return Array.from(layers.values()).sort((a, b) => a.zIndex - b.zIndex);
  }, [layers]);

  return (
    <Group>
      {sortedLayers.map((layer) => {
        // 检查是否有临时位置以实现实时拖动效果
        const tempPosition = tempPositions[layer.id];
        const isDragging = draggingLayers.has(layer.id);

        // 关键改进：如果正在拖动并且有临时位置，创建带有临时位置的图层副本
        const renderedLayer =
          isDragging && tempPosition
            ? {
                ...layer,
                transform: {
                  ...layer.transform,
                  position: tempPosition,
                },
              }
            : layer;

        return (
          <LayerFactory
            key={layer.id}
            layer={renderedLayer} // 使用可能带有临时位置的图层
            isSelected={layer.id === selectedLayerId}
          />
        );
      })}
    </Group>
  );
};
```

主要改进点：

1. 从 `useTempPositionStore` 获取临时位置和拖动状态
2. 在渲染前检查图层是否正在拖动
3. 为正在拖动的图层创建包含临时位置的副本

### 依赖项问题修复

修复 `LayerGestureManager` 中的依赖项问题：

```typescript
// app/features/gestures/LayerGestureManager.tsx
import React, { FC, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useLayerStore } from "../../store/useLayerStore";
import { LayerGestureHandler } from "./LayerGestureHandler";

export const LayerGestureManager: FC = () => {
  // 关键改进：正确订阅 layers 状态
  const layers = useLayerStore((state) => state.layers);

  // 基于最新的 layers 状态计算层级排序
  const layersArray = useMemo(() => {
    console.log("LayerGestureManager: Found", layers.size, "layers");
    return Array.from(layers.values()).sort((a, b) => b.zIndex - a.zIndex);
  }, [layers]); // 正确的依赖项

  console.log(
    "LayerGestureManager rendering with",
    layersArray.length,
    "layers"
  );

  return (
    <View style={styles.container} pointerEvents="box-none">
      {layersArray.map((layer) => {
        console.log(`Creating gesture handler for layer ${layer.id}`);
        return <LayerGestureHandler key={layer.id} layer={layer} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1500, // 确保在大多数元素上面，但在测试框下面
    backgroundColor: "rgba(0,0,255,0.1)",
    pointerEvents: "box-none", // 确保事件可以穿透到非手势区域
  },
});
```

主要修复点：

1. 使用 `useLayerStore((state) => state.layers)` 正确订阅 layers 状态
2. 将 `layers` 作为 `useMemo` 的依赖项，确保图层变化时重新计算

### 闪烁问题解决方案

为解决拖动结束时的闪烁问题，我们采用了两个关键修改：

1. **改变状态更新顺序**：先更新永久位置，再标记拖动结束
2. **延迟清除临时位置**：确保平滑过渡

```typescript
// useTempPositionStore.ts 中的延迟清除机制
finishDragging: (id: string) => {
  try {
    set((state) => {
      const newDraggingLayers = new Set(state.draggingLayers);
      newDraggingLayers.delete(id);

      // 重要：不要立即删除临时位置，让它保持到下一次渲染
      return {
        draggingLayers: newDraggingLayers,
        // 不删除 positions[id]
      };
    });

    // 延迟清除临时位置，确保主状态已经更新
    setTimeout(() => {
      set((state) => {
        const newPositions = { ...state.positions };
        delete newPositions[id];
        return { positions: newPositions };
      });
    }, 50); // 短暂延迟，足够让渲染完成
  } catch (error) {
    console.error("Error in finishDragging:", error);
  }
};
```

这个解决方案的关键是理解状态更新和渲染的时序，确保状态转换过程中不会出现视觉上的不连续。

## 5. 效果比较

### 修改前：图层拖动行为描述

在实施这些修改前，图层拖动体验非常不理想：

- 拖动过程中完全没有视觉反馈
- 用户必须"凭感觉"拖动图层
- 松开手指后，图层突然跳到新位置
- 经常出现闪烁和视觉跳变
- 编辑精度严重受限

这种体验对于专业图像编辑应用来说完全不可接受，用户需要多次尝试才能准确放置图层。

### 修改后：实时流畅的拖动体验

实施修改后，体验得到了显著改善：

- 图层实时跟随手指移动，提供即时视觉反馈
- 选择指示器同步更新，增强了空间感知
- 拖动结束时没有闪烁或跳变，呈现平滑过渡
- 用户可以精确放置图层，提高了编辑效率
- 应用给人的印象更加专业和完善

这种流畅的拖动体验极大地提高了用户对应用的满意度和信任度。

### 性能影响考量

我们的解决方案在提供流畅体验的同时，也考虑了性能影响：

- **临时状态设计**：使用专门的状态存储管理临时位置，避免频繁更新主图层状态
- **渲染优化**：只为正在拖动的图层创建副本，不影响其他图层的渲染
- **动画工作线程**：利用 Reanimated 的工作线程处理位置计算，减轻主线程负担
- **延迟清理**：使用短暂延迟而非复杂的状态同步机制，简化实现的同时确保视觉平滑

测试表明，即使在中低端设备上，这些改进也没有导致明显的性能下降，体验依然流畅。

## 6. 经验总结

### 状态管理与渲染协调的重要性

从这个问题中，我们学到了状态管理与渲染系统协调的关键原则：

1. **状态变化必须触发相关渲染**：任何影响视觉呈现的状态变化必须能够触发相应的渲染更新
2. **多系统状态同步**：当使用多个专门系统（如手势、动画和渲染）时，必须设计明确的状态同步机制
3. **状态变化可见性**：确保状态变化对需要使用它的组件可见，通过正确的订阅机制
4. **避免隐式依赖**：明确组件之间的数据流，避免隐式或难以追踪的状态依赖

在复杂应用中，状态管理不仅关乎数据的一致性，也直接影响用户体验的流畅度。

### 临时状态与永久状态的设计模式

这个项目展示了临时状态与永久状态分离的有效设计模式：

1. **永久状态**：表示应用的核心数据模型，变化频率较低，由明确的用户动作触发
2. **临时状态**：表示交互过程中的中间状态，变化频繁，用于提供实时视觉反馈

这种分离使我们能够：

- 减少对核心数据模型的频繁更新
- 提供即时反馈而不触发昂贵的状态更新
- 在交互结束时优雅地将临时状态合并回永久状态
- 在状态转换过程中控制视觉连续性

这一模式不仅适用于拖动操作，也适用于许多其他需要即时反馈的交互，如调整大小、旋转和滑块控制等。

### React 依赖项的正确使用

这个问题强调了正确使用 React 依赖项的重要性：

1. **订阅而非获取**：使用订阅模式（`store((state) => state.value)`）而非直接获取（`store.getState().value`）
2. **正确的依赖声明**：确保 `useEffect`、`useMemo` 和 `useCallback` 的依赖数组包含所有响应值
3. **避免引用问题**：注意对象和函数的引用稳定性，避免不必要的重新计算
4. **状态选择器优化**：只选择组件真正需要的状态，避免因无关状态变化导致重新渲染

正确的依赖项设置不仅确保组件在正确的时机更新，也是避免性能问题的关键。

### 多状态更新的优化策略

在处理多个相关状态更新时，我们学到了几个重要策略：

1. **更新顺序敏感性**：考虑状态更新的顺序如何影响用户感知
2. **批处理更新**：尽可能将多个状态更新批处理，减少渲染次数
3. **过渡状态**：使用过渡状态桥接两个视觉上不同的状态
4. **延迟清理**：使用延迟清理机制确保状态转换的视觉平滑性
5. **动画驱动更新**：利用动画系统来驱动视觉更新，而非直接依赖状态变化

这些策略帮助我们创建了无缝的用户体验，即使在复杂的状态转换过程中也能保持视觉连续性。

## 7. 结论

### 用户体验改进

通过这一系列修改，我们实现了图层拖动体验的质的飞跃：

- **实时反馈**：用户可以立即看到拖动效果，无需等待
- **精确控制**：实时更新使精确定位变得容易
- **直观操作**：所见即所得的互动模式符合用户心理模型
- **专业感提升**：流畅的操作体验提升了应用的专业形象
- **降低挫折感**：消除了延迟反馈和闪烁带来的挫折感

这些改进不仅提高了用户满意度，也使应用更加符合专业图像编辑工具的期望标准。

### 技术架构优化

除了用户体验改进，这个项目也带来了架构上的优化：

- **状态管理分层**：永久状态与临时状态的清晰分离
- **系统间连接**：手势、动画和渲染系统的协调一致
- **依赖管理改进**：更正确、高效的组件依赖设置
- **性能优化模式**：减少不必要的重渲染和状态更新
- **错误处理增强**：更健壮的错误捕获和恢复机制

这些架构优化不仅解决了当前问题，也为未来功能开发和维护奠定了更坚实的基础。

### 未来可能的改进方向

虽然我们的解决方案有效地解决了当前问题，但仍有几个可能的改进方向：

1. **统一状态管理**：考虑更紧密地集成临时状态和永久状态
2. **动画过渡**：添加更高级的动画过渡，如弹性效果或加速度
3. **性能监控**：添加性能监控工具，确保在复杂场景中依然保持流畅
4. **多手势协调**：改进多图层同时操作时的体验
5. **撤销/重做集成**：确保临时状态变化也能正确集成到撤销/重做系统中

这个项目展示了细致的技术实现如何显著提升用户体验，以及在复杂 React Native 应用中实现流畅交互的最佳实践。
