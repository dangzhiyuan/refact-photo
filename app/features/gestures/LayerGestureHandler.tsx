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
    })
    .onChange((e) => {
      // 更新动画值
      translateX.value += e.changeX;
      translateY.value += e.changeY;
    })
    .onEnd(() => {
      console.log(`LAYER ${layer.id} PAN ENDED`);

      // 拖动结束后更新图层状态
      runOnJS(updateLayer)(layer.id, {
        transform: {
          ...layer.transform,
          position: {
            x: translateX.value,
            y: translateY.value,
          },
        },
      });
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
      <Animated.View style={[styles.gestureArea, animatedStyle]}>
        <Text style={styles.layerLabel}>{layer.id.substring(0, 4)}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  gestureArea: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
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
