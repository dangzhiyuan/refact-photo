import React, { useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { useCanvasStore } from "../../store/canvasStore";
import { Canvas, Image, useImage } from "@shopify/react-native-skia";
import { GestureDetector } from "react-native-gesture-handler";
import { Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import { LayerType, StickerLayer } from "../../core/types/canvas";
import { SelectionFrame } from "../common/SelectionFrame";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SCALE_LIMITS = {
  min: 0.5,
  max: 3,
};

interface StickerCanvasProps {
  layerId: string;
  initialScale?: number;
  isActive?: boolean; // 是否为当前选中的图层
  onSelect?: (id: string) => void; // 选择图层的回调
  onDelete?: (id: string) => void; // 删除图层的回调
}

export const StickerCanvas: React.FC<StickerCanvasProps> = ({
  layerId,
  initialScale = 1,
  isActive = false,
  onSelect,
  onDelete,
}) => {
  // 获取贴纸图层数据
  const layer = useCanvasStore((state) =>
    state.layers[layerId] && state.layers[layerId].type === LayerType.STICKER
      ? (state.layers[layerId] as StickerLayer)
      : null
  );

  // 更新图层函数
  const updateLayer = useCanvasStore((state) => state.updateLayer);
  const deleteLayer = useCanvasStore((state) => state.deleteLayer);

  // 所有的 hooks 必须在组件顶层调用，在任何条件语句之前
  // 加载贴纸图像 - 即使图层不存在也要调用这个 hook
  const image = useImage(layer?.stickerUri || "");

  // 创建手势变量 - 使用 SharedValue 处理变换
  const scale = useSharedValue(initialScale);
  const savedScale = useSharedValue(initialScale);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);
  const offset = useSharedValue({ x: 0, y: 0 });
  const start = useSharedValue({ x: 0, y: 0 });

  // 优化触摸事件处理
  const handlePress = useCallback(() => {
    if (onSelect) {
      // 使用 requestAnimationFrame 确保在UI线程空闲时执行
      requestAnimationFrame(() => {
        onSelect(layerId);
      });
    }
  }, [layerId, onSelect]);

  // 优化贴纸删除事件处理
  const handleDelete = useCallback(() => {
    if (onDelete) {
      // 使用 requestAnimationFrame 确保在UI线程空闲时执行
      requestAnimationFrame(() => {
        onDelete(layerId);
      });
    }
  }, [layerId, onDelete]);

  // 使用 useMemo 缓存贴纸变换样式，避免不必要的重新计算
  const animatedStyle = useAnimatedStyle(() => {
    if (!layer) {
      return {
        position: "absolute",
        width: 0,
        height: 0,
        opacity: 0,
      };
    }

    return {
      position: "absolute",
      width: layer?.width || 0,
      height: layer?.height || 0,
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
        { scale: scale.value },
        { rotate: `${rotation.value}rad` },
      ],
    };
  });

  // 如果没有找到图层或者类型不匹配或没有加载图像，返回空视图
  if (!layer || layer.type !== LayerType.STICKER || !image) {
    return null;
  }

  // 更新图层位置函数
  const updateStickerTransform = () => {
    if (layer) {
      updateLayer(layerId, {
        transform: {
          position: { x: offset.value.x, y: offset.value.y },
          scale: scale.value,
          rotation: rotation.value,
        },
      });
    }
  };

  // 平移手势
  const panGesture = Gesture.Pan()
    .onStart(() => {
      "worklet";
      // 开始拖动时自动选中该贴纸
      runOnJS(handlePress)();
      start.value = { ...offset.value };
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
      runOnJS(updateStickerTransform)();
    });

  // 缩放手势
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      "worklet";
      // 开始缩放时自动选中该贴纸
      runOnJS(handlePress)();
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      "worklet";
      const newScale = savedScale.value * e.scale;
      scale.value = Math.min(
        Math.max(newScale, SCALE_LIMITS.min),
        SCALE_LIMITS.max
      );
    })
    .onEnd(() => {
      "worklet";
      runOnJS(updateStickerTransform)();
    });

  // 旋转手势
  const rotateGesture = Gesture.Rotation()
    .onStart(() => {
      "worklet";
      // 开始旋转时自动选中该贴纸
      runOnJS(handlePress)();
      savedRotation.value = rotation.value;
    })
    .onUpdate((e) => {
      "worklet";
      rotation.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      "worklet";
      runOnJS(updateStickerTransform)();
    });

  // 组合手势
  const gesture = Gesture.Simultaneous(
    panGesture,
    Gesture.Simultaneous(pinchGesture, rotateGesture)
  );

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.stickerContainer, animatedStyle]}>
          <Canvas style={styles.canvas}>
            <Image
              image={image}
              x={0}
              y={0}
              width={layer.width}
              height={layer.height}
              fit="contain"
            />
          </Canvas>

          {/* 可点击的透明覆盖层，覆盖整个贴纸区域 */}
          <TouchableWithoutFeedback onPress={handlePress}>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "transparent",
              }}
            />
          </TouchableWithoutFeedback>
        </Animated.View>
      </GestureDetector>

      {/* 选择框 */}
      {isActive && (
        <SelectionFrame
          position={offset}
          width={layer.width}
          height={layer.height}
          rotation={rotation}
          scale={scale}
          onDelete={handleDelete}
          onRotate={() => {}}
          onResize={() => {}}
          onEdit={() => {}}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "box-none",
  },
  touchableContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  stickerContainer: {
    position: "absolute",
  },
  canvas: {
    flex: 1,
  },
});
