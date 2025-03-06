import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, runOnJS } from "react-native-reanimated";
import { Dimensions } from "react-native";
import { useEffect } from "react";

// 获取屏幕尺寸
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 缩放限制
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
  // 共享值 - 回到使用对象进行位置管理
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const offset = useSharedValue({ x: 0, y: 0 });
  const start = useSharedValue({ x: 0, y: 0 });
  const isActive = useSharedValue(false);

  // 自动适配逻辑
  useEffect(() => {
    if (
      autoFit &&
      contentWidth &&
      contentHeight &&
      contentWidth > 0 &&
      contentHeight > 0
    ) {
      console.log("执行自动居中", {
        contentWidth,
        contentHeight,
        viewportWidth,
        viewportHeight,
      });

      // 计算合适的初始缩放
      let fitScale = 1;

      // 基于内容和视口的尺寸计算合适的缩放
      const horizontalScale = viewportWidth / contentWidth;
      const verticalScale = viewportHeight / contentHeight;

      // 使用较小的缩放因子确保内容完全可见
      fitScale = Math.min(horizontalScale, verticalScale) * 0.85; // 留15%边距

      // 设置缩放
      scale.value = fitScale;
      savedScale.value = fitScale;

      // 计算居中位置 - 修正这个部分
      // 关键在于计算内容在视口中央的位置
      const centerX = (viewportWidth - contentWidth * fitScale) / 2;
      const centerY = (viewportHeight - contentHeight * fitScale) / 2;

      console.log("计算的居中位置", { centerX, centerY, fitScale });

      // 设置偏移使内容居中
      offset.value = {
        x: centerX,
        y: centerY,
      };
    }
  }, [contentWidth, contentHeight, viewportWidth, viewportHeight, autoFit]);

  // 安全地调用转换结束回调
  const safelyCallTransformEnd = () => {
    if (onTransformEnd) {
      onTransformEnd({
        scale: scale.value,
        x: offset.value.x,
        y: offset.value.y,
      });
    }
  };

  // 平移手势 - 更简洁的实现
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

  // 缩放手势 - 简化实现，不要过度处理中心点
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

  // 使用Simultaneous代替Race
  const gesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // 修改命中测试函数
  const isPointInsideContent = (
    x: number, // 触摸点X坐标
    y: number, // 触摸点Y坐标
    offsetX: number, // 当前内容偏移X
    offsetY: number, // 当前内容偏移Y
    currentScale: number // 当前缩放比例
  ) => {
    if (!hitTestEnabled) return true;

    // 获取滚动视图的尺寸
    const containerLeft = offsetX;
    const containerTop = offsetY;

    // 计算内容区域的边界，考虑了缩放和偏移
    const contentLeft = containerLeft;
    const contentTop = containerTop;
    const contentRight = contentLeft + contentWidth * currentScale;
    const contentBottom = contentTop + contentHeight * currentScale;

    // 判断触摸点是否在内容区域内
    return (
      x >= contentLeft &&
      x <= contentRight &&
      y >= contentTop &&
      y <= contentBottom
    );
  };

  return {
    gesture,
    scale,
    offset,
    isActive,
  };
};
