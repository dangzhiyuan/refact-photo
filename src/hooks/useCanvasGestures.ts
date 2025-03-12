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
  initialOffset?: { x: number; y: number };
  autoFit?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
  hitTestEnabled?: boolean;
  onDragStart?: () => void;
}

export const useCanvasGestures = ({
  enabled = true,
  contentWidth = SCREEN_WIDTH,
  contentHeight = SCREEN_HEIGHT,
  onTransformEnd,
  initialScale = 1,
  initialOffset = { x: 0, y: 0 },
  autoFit = true,
  viewportWidth = SCREEN_WIDTH - 40,
  viewportHeight = SCREEN_HEIGHT * 0.55,
  hitTestEnabled = true,
  onDragStart,
}: UseCanvasGesturesProps = {}) => {
  const scale = useSharedValue(initialScale);
  const savedScale = useSharedValue(initialScale);
  const offset = useSharedValue(initialOffset);
  const start = useSharedValue({ x: 0, y: 0 });
  const isActive = useSharedValue(false);

  useEffect(() => {
    console.log("初始缩放更新:", initialScale);
    scale.value = initialScale;
    savedScale.value = initialScale;
  }, [initialScale, scale, savedScale]);

  useEffect(() => {
    console.log("初始位置更新:", initialOffset);
    offset.value = initialOffset;
  }, [initialOffset, offset]);

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
  }, [
    contentWidth,
    contentHeight,
    viewportWidth,
    viewportHeight,
    autoFit,
    scale,
    savedScale,
    offset,
  ]);

  const safelyCallTransformEnd = () => {
    if (onTransformEnd) {
      const transform = {
        scale: scale.value,
        x: offset.value.x,
        y: offset.value.y,
      };
      console.log("变换结束，保存状态:", transform);
      onTransformEnd(transform);
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

      if (onDragStart) {
        runOnJS(onDragStart)();
      }
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
        const newScale = Math.max(
          SCALE_LIMITS.min,
          Math.min(SCALE_LIMITS.max, savedScale.value * e.scale)
        );
        scale.value = newScale;
      } catch (error) {
        // 错误处理（无需日志输出）
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
