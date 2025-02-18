import { useCallback } from "react";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, runOnJS } from "react-native-reanimated";
import { Transform } from "../../../types/layer";

interface UseCanvasGestureProps {
  onTransformEnd: (transform: Transform) => void;
}

export const useCanvasGesture = ({ onTransformEnd }: UseCanvasGestureProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const handleTransformEnd = useCallback(() => {
    "worklet";
    runOnJS(onTransformEnd)({
      position: { x: translateX.value, y: translateY.value },
      scale: scale.value,
      rotation: rotation.value,
    });
  }, [onTransformEnd, translateX, translateY, scale, rotation]);

  const gesture = Gesture.Simultaneous(
    Gesture.Pan()
      .onChange((e) => {
        translateX.value += e.changeX;
        translateY.value += e.changeY;
      })
      .onEnd(handleTransformEnd),

    Gesture.Pinch()
      .onChange((e) => {
        scale.value *= e.scaleChange;
      })
      .onEnd(handleTransformEnd),

    Gesture.Rotation()
      .onChange((e) => {
        rotation.value += e.rotationChange;
      })
      .onEnd(handleTransformEnd)
  );

  return { gesture };
};
