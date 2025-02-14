import { useCallback } from "react";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import { useCanvasStore } from "../../../store/useCanvasStore";
import { CANVAS_AREA } from "../../../constants/layout";

export const useCanvasGestures = () => {
  const { selectedLayerId, moveLayer, transformLayer } = useCanvasStore();

  // 共享值
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);
  const offset = useSharedValue({ x: 0, y: 0 });
  const start = useSharedValue({ x: 0, y: 0 });
  const isGestureActive = useSharedValue(false);

  // 平移手势
  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onStart(() => {
      "worklet";
      isGestureActive.value = true;
      const layer = useCanvasStore.getState().layers[0]; // 暂时只处理第一个图层
      if (layer) {
        start.value = layer.position;
        offset.value = layer.position;
      }
    })
    .onUpdate((e) => {
      "worklet";
      const newX = e.translationX + start.value.x;
      const newY = e.translationY + start.value.y;
      offset.value = { x: newX, y: newY };
    })
    .onEnd(() => {
      "worklet";
      isGestureActive.value = false;
      runOnJS(moveLayer)(useCanvasStore.getState().layers[0].id, offset.value);
    });

  // 缩放手势
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      "worklet";
      isGestureActive.value = true;
    })
    .onUpdate((e) => {
      "worklet";
      const newScale = savedScale.value * e.scale;
      scale.value = Math.min(Math.max(newScale, 0.5), 2);
    })
    .onEnd(() => {
      "worklet";
      isGestureActive.value = false;
      savedScale.value = scale.value;
      runOnJS(transformLayer)(
        useCanvasStore.getState().layers[0].id,
        scale.value,
        rotation.value
      );
    });

  // 组合手势
  const gesture = Gesture.Simultaneous(panGesture, pinchGesture);

  return {
    gesture,
    scale,
    rotation,
    offset,
    isGestureActive,
  };
};
