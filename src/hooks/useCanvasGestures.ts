import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, runOnJS } from "react-native-reanimated";
import { Dimensions } from "react-native";
import { useEffect } from "react";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SCALE_LIMITS = {
  min: 0.5,
  max: 3,
};

interface UseCanvasGesturesProps {
  enabled?: boolean;
  contentWidth?: number;
  contentHeight?: number;
  onTransformEnd?: (transform: { scale: number; x: number; y: number }) => void;
  initialScale?: number;
  autoFit?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
  hitTestEnabled?: boolean;
}

export const useCanvasGestures = ({
  enabled = true,
  contentWidth = SCREEN_WIDTH,
  contentHeight = SCREEN_HEIGHT,
  onTransformEnd,
  initialScale = 1,
  autoFit = true,
  viewportWidth = SCREEN_WIDTH - 40,
  viewportHeight = SCREEN_HEIGHT * 0.55,
  hitTestEnabled = true,
}: UseCanvasGesturesProps = {}) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const offset = useSharedValue({ x: 0, y: 0 });
  const start = useSharedValue({ x: 0, y: 0 });
  const isActive = useSharedValue(false);

  useEffect(() => {
    if (
      autoFit &&
      contentWidth &&
      contentHeight &&
      contentWidth > 0 &&
      contentHeight > 0
    ) {
      let fitScale = 1;
      const horizontalScale = viewportWidth / contentWidth;
      const verticalScale = viewportHeight / contentHeight;
      fitScale = Math.min(horizontalScale, verticalScale) * 0.85;

      scale.value = fitScale;
      savedScale.value = fitScale;
      const centerX = (viewportWidth - contentWidth * fitScale) / 2;
      const centerY = (viewportHeight - contentHeight * fitScale) / 2;
      offset.value = {
        x: centerX,
        y: centerY,
      };
    }
  }, [contentWidth, contentHeight, viewportWidth, viewportHeight, autoFit]);

  const safelyCallTransformEnd = () => {
    if (onTransformEnd) {
      onTransformEnd({
        scale: scale.value,
        x: offset.value.x,
        y: offset.value.y,
      });
    }
  };

  const panGesture = Gesture.Pan()
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
      runOnJS(safelyCallTransformEnd)();
    });

  const pinchGesture = Gesture.Pinch()
    .enabled(enabled)
    .onStart(() => {
      "worklet";
      savedScale.value = scale.value;
      isActive.value = true;
    })
    .onUpdate((e) => {
      "worklet";
      try {
        const newScale = savedScale.value * e.scale;
        scale.value = Math.min(
          Math.max(newScale, SCALE_LIMITS.min),
          SCALE_LIMITS.max
        );
      } catch (error) {
        console.log("缩放错误", error);
      }
    })
    .onEnd(() => {
      "worklet";
      isActive.value = false;
      runOnJS(safelyCallTransformEnd)();
    });

  const gesture = Gesture.Simultaneous(panGesture, pinchGesture);

  return {
    gesture,
    scale,
    offset,
    isActive,
  };
};
