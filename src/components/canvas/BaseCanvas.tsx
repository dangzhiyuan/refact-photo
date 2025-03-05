import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  View,
  Image as RNImage,
  Text,
} from "react-native";
import { Canvas, Image, useImage } from "@shopify/react-native-skia";
import { useEditorStore } from "../../store/editorStore";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

const DEFAULT_IMAGE_URL =
  "https://img2.baidu.com/it/u=3768614006,1074423183&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=856";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const BaseCanvas: React.FC = () => {
  // 本地加载状态
  const [isLoading, setIsLoading] = useState(true);

  // 状态
  const baseImageUri = useEditorStore((state) => state.baseImageUri);

  // 图像加载
  const userImage = useImage(baseImageUri);
  const defaultImage = useImage(DEFAULT_IMAGE_URL);
  const image = userImage || defaultImage;

  // 检查图像是否加载完成
  useEffect(() => {
    if (image) {
      setIsLoading(false);
      console.log("图像已加载!");
    } else {
      console.log("图像状态:", {
        baseImageUri,
        userImageLoaded: !!userImage,
        defaultImageLoaded: !!defaultImage,
        usingImage: !!image,
      });
    }
  }, [image, baseImageUri, userImage, defaultImage]);

  // 位置和缩放值
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // 平移手势
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      console.log("开始拖动");
    })
    .onChange((e) => {
      translateX.value = startX.value + e.changeX;
      translateY.value = startY.value + e.changeY;
    })
    .onEnd(() => {
      console.log("结束拖动，位置:", {
        x: translateX.value,
        y: translateY.value,
      });
    });

  // 缩放手势
  const pinchGesture = Gesture.Pinch()
    .runOnJS(true)
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onChange((e) => {
      scale.value = savedScale.value * e.scale;
    });

  // 同时支持两种手势
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // 动画样式
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // 加载状态
  if (isLoading) {
    console.log("显示加载状态...");
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>加载图像中...</Text>
        {/* 使用React Native Image作为备用 */}
        <RNImage
          source={{ uri: DEFAULT_IMAGE_URL }}
          style={{ width: 1, height: 1 }} // 小尺寸仅用于触发加载
          onLoad={() => console.log("RN Image加载成功")}
          onError={(e) => console.log("RN Image加载失败", e.nativeEvent.error)}
        />
      </View>
    );
  }

  // 如果图像未加载后仍然没有，显示错误容器
  if (!image) {
    console.log("图像加载失败");
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>无法加载图像</Text>
      </View>
    );
  }

  // 成功加载图像，显示可拖动的Canvas
  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.animatedContainer, animatedStyle]}>
        <Canvas style={styles.canvas}>
          <Image
            image={image}
            fit="contain"
            x={0}
            y={0}
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
          />
        </Canvas>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#f0f0f0",
  },
  animatedContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  canvas: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#900",
  },
  errorText: {
    color: "white",
    fontSize: 18,
  },
});
