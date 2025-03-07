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
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const layers = useLayerStore((state) => state.layers);
  const updateLayer = useLayerStore((state) => state.updateLayer);

  if (!selectedLayerId || !layers.has(selectedLayerId)) {
    return null;
  }

  const selectedLayer = layers.get(selectedLayerId)!;

  const tempPositions = useTempPositionStore((state) => state.positions);
  const isDragging = useTempPositionStore((state) =>
    state.draggingLayers.has(selectedLayerId)
  );

  const effectivePosition =
    isDragging && tempPositions[selectedLayerId]
      ? tempPositions[selectedLayerId]
      : selectedLayer.transform.position;

  const { width, height } = calculateLayerDimensions(selectedLayer);

  const margin = 4;

  const handleSize = 20;

  const frameX = effectivePosition.x - margin;
  const frameY = effectivePosition.y - margin;
  const frameWidth = width + margin * 2;
  const frameHeight = height + margin * 2;

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
