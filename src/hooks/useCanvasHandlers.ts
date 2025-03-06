import { useCallback } from "react";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useCanvasStore } from "../store/canvasStore";

export function useCanvasHandlers(
  canvasType: "base" | "drawing" | "content" | "control",
  isActive: boolean
) {
  const { setActiveCanvas, updateTransform, transform } = useCanvasStore();

  // 创建手势处理器
  const createGestures = useCallback(() => {
    // 点击激活手势
    const tapGesture = Gesture.Tap().onEnd(() => {
      console.log(`激活画布: ${canvasType}`);
      runOnJS(setActiveCanvas)(canvasType);
    });

    // 只有活动的Canvas才处理变换手势
    if (!isActive) {
      return tapGesture;
    }

    // 平移手势
    const panGesture = Gesture.Pan()
      .runOnJS(true)
      .onStart(() => {
        // 记录开始位置
      })
      .onChange((e) => {
        // 更新位置
        runOnJS(updateTransform)({
          translateX: transform.translateX + e.changeX,
          translateY: transform.translateY + e.changeY,
        });
      });

    // 缩放手势
    const pinchGesture = Gesture.Pinch()
      .runOnJS(true)
      .onChange((e) => {
        runOnJS(updateTransform)({
          scale: transform.scale * e.scaleChange,
        });
      });

    return Gesture.Race(
      Gesture.Simultaneous(panGesture, pinchGesture),
      tapGesture
    );
  }, [canvasType, isActive, setActiveCanvas, updateTransform, transform]);

  return {
    gesture: createGestures(),
    isActive,
  };
}
