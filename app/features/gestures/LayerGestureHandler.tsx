import React, { FC, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import { Layer } from "../../types/layer";
import { useLayerStore } from "../../store/useLayerStore";
import { calculateLayerDimensions } from "../../utils/layerUtils";
import {
  tempUpdateLayerPosition,
  markLayerAsDragging,
} from "../../store/useTempPositionStore";

interface LayerGestureHandlerProps {
  layer: Layer;
}

export const LayerGestureHandler: FC<LayerGestureHandlerProps> = ({
  layer,
}) => {
  const { selectLayer, updateLayer } = useLayerStore();
  const { width, height } = calculateLayerDimensions(layer);

  // 创建动画值
  const translateX = useSharedValue(layer.transform.position.x);
  const translateY = useSharedValue(layer.transform.position.y);

  // 当图层位置在状态中更新时，同步到动画值
  useEffect(() => {
    translateX.value = layer.transform.position.x;
    translateY.value = layer.transform.position.y;
  }, [layer.transform.position.x, layer.transform.position.y]);

  // 手势处理
  const panGesture = Gesture.Pan()
    .onStart(() => {
      console.log(`LAYER ${layer.id} PAN STARTED`);
      runOnJS(selectLayer)(layer.id);
      // 标记图层开始拖动
      runOnJS(markLayerAsDragging)(layer.id, true);
    })
    .onChange((e) => {
      // 更新动画值
      translateX.value += e.changeX;
      translateY.value += e.changeY;

      // 恢复使用原始更新函数
      runOnJS(tempUpdateLayerPosition)(
        layer.id,
        translateX.value,
        translateY.value
      );
    })
    .onEnd(() => {
      console.log(`LAYER ${layer.id} PAN ENDED`);

      // 获取当前的临时位置值
      const finalPosition = {
        x: translateX.value,
        y: translateY.value,
      };

      // 首先更新图层的实际位置（不会立即触发渲染）
      runOnJS(updateLayer)(layer.id, {
        transform: {
          ...layer.transform,
          position: finalPosition,
        },
      });

      // 然后再标记图层结束拖动（确保位置已更新）
      runOnJS(markLayerAsDragging)(layer.id, false);
    });

  // 创建动画样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      width: width,
      height: height,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[styles.gestureArea, animatedStyle]}
      ></Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  gestureArea: {
    backgroundColor: "transparent",
    position: "absolute",
  },
  layerLabel: {
    color: "white",
    fontSize: 10,
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
});
