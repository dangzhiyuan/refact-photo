import { Gesture } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import { CANVAS_AREA } from "../../constants/layout";
import { Transform } from "../../types/layer";
import { useCallback, useEffect } from "react";

interface UseLayerGesturesProps {
  enabled: boolean;
  initialTransform: Transform;
  onTransformEnd?: (transform: Transform) => void;
  onTransformChange?: (values: {
    translateX: number;
    translateY: number;
    scale: number;
    rotate: number;
  }) => void;
}

export const useLayerGestures = ({
  enabled,
  initialTransform,
  onTransformEnd,
  onTransformChange,
}: UseLayerGesturesProps) => {
  // 共享值
  const scale = useSharedValue(initialTransform.scale);
  const savedScale = useSharedValue(initialTransform.scale);
  const position = useSharedValue(initialTransform.position);
  const start = useSharedValue(initialTransform.position);
  const rotation = useSharedValue(initialTransform.rotation);
  const isActive = useSharedValue(false);

  // 平移手势
  const dragGesture = Gesture.Pan()
    .enabled(enabled)
    .minPointers(1)
    .maxPointers(1)
    .onStart(() => {
      "worklet";
      start.value = { ...position.value };
      isActive.value = true;
    })
    .onUpdate((e) => {
      "worklet";
      position.value = {
        x: start.value.x + e.translationX,
        y: start.value.y + e.translationY,
      };
    })
    .onEnd(() => {
      "worklet";
      isActive.value = false;
      onTransformEnd &&
        onTransformEnd({
          position: position.value,
          scale: scale.value,
          rotation: rotation.value,
        });
    });

  // 缩放手势
  const pinchGesture = Gesture.Pinch()
    .enabled(enabled)
    .onStart(() => {
      "worklet";
      savedScale.value = scale.value;
      isActive.value = true;
    })
    .onUpdate((e) => {
      "worklet";
      const newScale = savedScale.value * e.scale;
      scale.value = Math.min(
        Math.max(newScale, CANVAS_AREA.scale.min),
        CANVAS_AREA.scale.max
      );
    })
    .onEnd(() => {
      "worklet";
      isActive.value = false;
      onTransformEnd &&
        onTransformEnd({
          position: position.value,
          scale: scale.value,
          rotation: rotation.value,
        });
    });

  // 组合手势
  const gesture = Gesture.Simultaneous(dragGesture, pinchGesture);

  // 添加变换更新回调
  useEffect(() => {
    if (onTransformChange) {
      onTransformChange({
        translateX: position.value.x,
        translateY: position.value.y,
        scale: scale.value,
        rotate: rotation.value,
      });
    }
  }, [position.value, scale.value, rotation.value, onTransformChange]);

  return {
    gesture,
    scale,
    position,
    rotation,
    isActive,
  };
};
