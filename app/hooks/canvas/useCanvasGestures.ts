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
  // 共享值
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const offset = useSharedValue({ x: 0, y: 0 });
  const start = useSharedValue({ x: 0, y: 0 });
  const isActive = useSharedValue(false);

  // 平移手势
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

  // 缩放手势
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

  // 组合手势
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

// 边界检查函数
const boundOffset = (
  offset: { x: number; y: number },
  scale: number
): { x: number; y: number } => {
  const maxOffset = {
    x: ((scale - 1) * CANVAS_AREA.width) / 2,
    y: ((scale - 1) * CANVAS_AREA.height) / 2,
  };

  return {
    x: Math.min(Math.max(offset.x, -maxOffset.x), maxOffset.x),
    y: Math.min(Math.max(offset.y, -maxOffset.y), maxOffset.y),
  };
};
