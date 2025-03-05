import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, runOnJS, withTiming } from "react-native-reanimated";
import { Dimensions } from "react-native";
import { useEffect } from "react";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 缩放限制
const MIN_SCALE = 0.5;
const MAX_SCALE = 5;
const ANIMATION_DURATION = 250;

// 调试工具函数
function logGesture(message: string, data: any) {
  console.log(`[Gesture] ${message}:`, data);
}

export const useImageGestures = () => {
  // 创建共享值
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const offset = useSharedValue({ x: 0, y: 0 });
  const start = useSharedValue({ x: 0, y: 0 });
  const isActive = useSharedValue(false);

  // 使用顶级变量跟踪最新的值 (不影响渲染)
  const _debugPanCoords = { x: 0, y: 0, translation: { x: 0, y: 0 } };

  useEffect(() => {
    console.log("[Gesture] 初始化手势系统");
    // 每500毫秒打印当前值
    const timer = setInterval(() => {
      if (isActive.value) {
        console.log("[Gesture] 实时坐标:", _debugPanCoords);
      }
    }, 500);

    return () => clearInterval(timer);
  }, []);

  // 边界检查函数
  const boundOffset = (
    offset: { x: number; y: number },
    scale: number
  ): { x: number; y: number } => {
    // 当缩放为1时，重置位置
    if (scale <= 1) {
      return { x: 0, y: 0 };
    }

    const maxOffset = {
      x: ((scale - 1) * SCREEN_WIDTH) / 2,
      y: ((scale - 1) * SCREEN_HEIGHT) / 2,
    };

    return {
      x: Math.min(Math.max(offset.x, -maxOffset.x), maxOffset.x),
      y: Math.min(Math.max(offset.y, -maxOffset.y), maxOffset.y),
    };
  };

  // 辅助函数 - 在JS线程打印
  const debugPan = (event, phase) => {
    _debugPanCoords.x = event.absoluteX;
    _debugPanCoords.y = event.absoluteY;
    _debugPanCoords.translation = {
      x: event.translationX,
      y: event.translationY,
    };

    console.log(`[Gesture] Pan ${phase}:`, {
      absolute: { x: event.absoluteX, y: event.absoluteY },
      translation: { x: event.translationX, y: event.translationY },
      velocity: { x: event.velocityX, y: event.velocityY },
    });
  };

  try {
    // 平移手势 - 添加更多调试输出
    const panGesture = Gesture.Pan()
      .minDistance(0) // 减少激活所需的最小移动距离
      .runOnJS(true) // 强制在JS线程上运行回调以确保日志显示
      .onBegin((e) => {
        console.log("[Gesture] 手势开始识别");
        debugPan(e, "begin");
      })
      .onStart((e) => {
        console.log("[Gesture] 平移开始");
        debugPan(e, "start");
        start.value = { ...offset.value };
        isActive.value = true;
      })
      .onUpdate((e) => {
        // 周期性地打印更新
        if (Math.random() < 0.1) {
          // 只打印约10%的更新以减少日志溢出
          debugPan(e, "update");
        }

        // 只有当缩放大于1时才允许拖动
        if (scale.value > 1) {
          const newOffset = {
            x: start.value.x + e.translationX,
            y: start.value.y + e.translationY,
          };

          // 应用边界限制
          offset.value = boundOffset(newOffset, scale.value);
          console.log("[Gesture] 应用新位置:", offset.value);
        } else {
          console.log("[Gesture] 缩放比例太小，不允许拖动");
        }
      })
      .onEnd((e) => {
        console.log("[Gesture] 平移结束");
        debugPan(e, "end");
        isActive.value = false;
      })
      .onFinalize(() => {
        console.log("[Gesture] 平移手势清理");
      });

    // 缩放手势
    const pinchGesture = Gesture.Pinch()
      .runOnJS(true)
      .onStart((e) => {
        console.log("[Gesture] 缩放开始:", e.scale);
        savedScale.value = scale.value;
        isActive.value = true;
      })
      .onUpdate((e) => {
        if (Math.random() < 0.1) {
          console.log("[Gesture] 缩放更新:", e.scale);
        }

        const newScale = savedScale.value * e.scale;
        const limitedScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
        scale.value = limitedScale;

        // 重新应用边界限制
        offset.value = boundOffset(offset.value, limitedScale);
      })
      .onEnd((e) => {
        console.log("[Gesture] 缩放结束:", e.scale);
        savedScale.value = scale.value;
        isActive.value = false;
      });

    // 双击重置手势
    const doubleTapGesture = Gesture.Tap()
      .runOnJS(true)
      .numberOfTaps(2)
      .maxDuration(300)
      .onStart((e) => {
        console.log("[Gesture] 双击开始", { x: e.x, y: e.y });
      })
      .onEnd(() => {
        console.log("[Gesture] 双击重置");
        scale.value = withTiming(1, { duration: ANIMATION_DURATION });
        offset.value = {
          x: withTiming(0, { duration: ANIMATION_DURATION }),
          y: withTiming(0, { duration: ANIMATION_DURATION }),
        };
        savedScale.value = 1;
      });

    // 组合所有手势
    const gesture = Gesture.Exclusive(
      doubleTapGesture,
      Gesture.Simultaneous(panGesture, pinchGesture)
    );

    return {
      gesture,
      scale,
      offset,
      isActive,
    };
  } catch (error) {
    console.error("[Gesture] 创建手势出错:", error);

    // 返回空手势以避免崩溃
    return {
      gesture: Gesture.Tap(),
      scale,
      offset,
      isActive,
    };
  }
};
