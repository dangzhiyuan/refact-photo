import { Gesture } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import { CANVAS_AREA } from "../../constants/layout";
import { Transform } from "../../types/layer";

interface UseCanvasGesturesProps {
  enabled: boolean;
  onTransformEnd: (transform: Transform) => void;
}

export const useCanvasGestures = ({
  enabled,
  onTransformEnd,
}: UseCanvasGesturesProps) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const offset = useSharedValue({ x: 0, y: 0 });
  const start = useSharedValue({ x: 0, y: 0 });
  const isActive = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onStart(() => {
      "worklet";
      start.value = { ...offset.value };
      isActive.value = true;
    })
    .onUpdate((e) => {
      "worklet";
      offset.value = {
        x: start.value.x + e.translationX,
        y: start.value.y + e.translationY,
      };
    })
    .onEnd(() => {
      "worklet";
      isActive.value = false;
    });

  const pinchGesture = Gesture.Pinch()
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
    });

  const gesture = Gesture.Simultaneous(
    Gesture.Pan()
      .enabled(enabled)
      .minPointers(1)
      .maxPointers(1)
      .onStart(() => {
        "worklet";
        start.value = { ...offset.value };
        isActive.value = true;
      })
      .onUpdate((e) => {
        "worklet";
        offset.value = {
          x: start.value.x + e.translationX,
          y: start.value.y + e.translationY,
        };
      })
      .onEnd(() => {
        "worklet";
        isActive.value = false;
      }),
    pinchGesture
  );

  return {
    gesture,
    scale,
    offset,
    isActive,
  };
};
