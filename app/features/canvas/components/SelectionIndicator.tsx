import React, { FC, useMemo } from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useLayerStore } from "../../../store/useLayerStore";
import { calculateLayerDimensions } from "../../../utils/layerUtils";
import { calculateFitSize } from "../../../utils/layoutUtils";

export const SelectionIndicator: FC = () => {
  const selectedLayer = useLayerStore((state) => {
    const id = state.selectedLayerId;
    return id ? state.layers.get(id) : null;
  });

  // 计算选择框尺寸和位置 - 把 useMemo 移到条件判断之前
  const dimensions = useMemo(() => {
    if (!selectedLayer) return { width: 0, height: 0 };

    // 根据图层类型使用不同的尺寸计算逻辑
    if (selectedLayer.type === "image") {
      const imageLayer = selectedLayer as any; // 类型断言
      if (imageLayer.imageSource) {
        // 只传递2个参数
        const fitSize = calculateFitSize(
          imageLayer.imageSource.width(),
          imageLayer.imageSource.height()
        );
        return { width: fitSize.width, height: fitSize.height };
      }
    }

    // 其他类型图层使用默认计算逻辑
    return calculateLayerDimensions(selectedLayer);
  }, [selectedLayer]);

  // 如果没有选中的图层，不渲染任何内容
  if (!selectedLayer) return null;

  // 边距，使选择框略大于图层
  const margin = 10;
  const { width, height } = dimensions;

  const indicatorStyle = {
    width: width + margin * 2,
    height: height + margin * 2,
    transform: [
      { translateX: selectedLayer.transform.position.x - margin },
      { translateY: selectedLayer.transform.position.y - margin },
      { scale: selectedLayer.transform.scale },
      { rotate: `${selectedLayer.transform.rotation}rad` },
    ],
  };

  return <Animated.View style={[styles.selectionIndicator, indicatorStyle]} />;
};

const styles = StyleSheet.create({
  selectionIndicator: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
    borderRadius: 4,
    pointerEvents: "none", // 不阻挡手势
  },
});
