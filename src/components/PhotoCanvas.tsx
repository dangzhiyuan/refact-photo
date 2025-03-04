import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useEditorStore } from "../store/editorStore";
import { useCanvasManager } from "../context/CanvasManagerContext";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { 
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS
} from "react-native-reanimated";

export const PhotoCanvas = () => {
  const { photo, transformPhoto } = useEditorStore();
  const { registerCanvas } = useCanvasManager();
  
  // 图片变换状态
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  
  // 添加移动灵敏度调整因子 - 值越小，移动越慢
  const MOVEMENT_FACTOR = 0.9; // 降低到原来的一半灵敏度
  
  // 缩放手势
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });
  
  // 平移手势
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // 应用移动因子来减缓移动速度
      translateX.value = savedTranslateX.value + e.translationX * MOVEMENT_FACTOR;
      translateY.value = savedTranslateY.value + e.translationY * MOVEMENT_FACTOR;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });
  
  // 组合手势
  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);
  
  // 图片样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });
  
  // 注册Canvas
  useEffect(() => {
    registerCanvas("photo", { type: "photo" });
  }, [registerCanvas]);
  
  useEffect(() => {
    // 重置变换值
    if (photo.uri) {
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
    }
  }, [photo.uri]);
  
  if (!photo.uri) {
    return null;
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.Image
          source={{ uri: photo.uri }}
          style={[styles.image, animatedStyle]}
          resizeMode="contain"
        />
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.7,
  },
}); 