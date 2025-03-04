import React, { FC, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useLayerStore } from "../../../store/useLayerStore";
import {
  useTempPositionStore,
  tempUpdateLayerPosition,
  markLayerAsDragging,
} from "../../../store/useTempPositionStore";
import { calculateLayerDimensions } from "../../../utils/layerUtils";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";

export const SelectionIndicator: FC = () => {
  // 获取选中的图层ID和图层
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const layers = useLayerStore((state) => state.layers);
  const updateLayer = useLayerStore((state) => state.updateLayer);

  // 没有选中图层时不渲染任何内容
  if (!selectedLayerId || !layers.has(selectedLayerId)) {
    return null;
  }

  const selectedLayer = layers.get(selectedLayerId)!;

  // 获取拖动状态和临时位置
  const tempPositions = useTempPositionStore((state) => state.positions);
  const isDragging = useTempPositionStore((state) =>
    state.draggingLayers.has(selectedLayerId)
  );

  // 获取实际使用的位置（临时位置或持久位置）
  const effectivePosition =
    isDragging && tempPositions[selectedLayerId]
      ? tempPositions[selectedLayerId]
      : selectedLayer.transform.position;

  // 计算图层尺寸
  const { width, height } = calculateLayerDimensions(selectedLayer);

  // 边距，使选择框略大于图层
  const margin = 4;

  // 控制点大小
  const handleSize = 20;

  // 计算选择框的位置和尺寸
  const frameX = effectivePosition.x - margin;
  const frameY = effectivePosition.y - margin;
  const frameWidth = width + margin * 2;
  const frameHeight = height + margin * 2;

  // 拖动手势处理
  const dragOffset = useSharedValue({ x: 0, y: 0 });

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(markLayerAsDragging)(selectedLayerId, true);
      dragOffset.value = { x: 0, y: 0 };
    })
    .onChange((e) => {
      dragOffset.value = {
        x: e.translationX,
        y: e.translationY,
      };

      runOnJS(tempUpdateLayerPosition)(
        selectedLayerId,
        effectivePosition.x + e.translationX,
        effectivePosition.y + e.translationY
      );
    })
    .onEnd(() => {
      runOnJS(updateLayer)(selectedLayerId, {
        transform: {
          ...selectedLayer.transform,
          position: {
            x: effectivePosition.x + dragOffset.value.x,
            y: effectivePosition.y + dragOffset.value.y,
          },
        },
      });

      runOnJS(markLayerAsDragging)(selectedLayerId, false);
    });

  // 选择框样式
  const frameStyle = {
    position: "absolute" as const,
    top: frameY,
    left: frameX,
    width: frameWidth,
    height: frameHeight,
    borderWidth: 2,
    borderColor: "#1E90FF",
    borderStyle: "solid" as const,
    backgroundColor: "transparent",
  };

  // 控制点基本样式
  const handleBaseStyle = {
    position: "absolute" as const,
    width: handleSize,
    height: handleSize,
    borderRadius: handleSize / 2,
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#1E90FF",
  };

  return (
    <GestureDetector gesture={dragGesture}>
      <View style={frameStyle}>
        {/* 左上角控制点 */}
        <View
          style={[
            handleBaseStyle,
            {
              top: -handleSize / 2,
              left: -handleSize / 2,
            },
          ]}
        />

        {/* 右上角控制点 */}
        <View
          style={[
            handleBaseStyle,
            {
              top: -handleSize / 2,
              right: -handleSize / 2,
            },
          ]}
        />

        {/* 左下角控制点 */}
        <View
          style={[
            handleBaseStyle,
            {
              bottom: -handleSize / 2,
              left: -handleSize / 2,
            },
          ]}
        />

        {/* 右下角控制点 */}
        <View
          style={[
            handleBaseStyle,
            {
              bottom: -handleSize / 2,
              right: -handleSize / 2,
            },
          ]}
        />
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  cornerHandle: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
});
