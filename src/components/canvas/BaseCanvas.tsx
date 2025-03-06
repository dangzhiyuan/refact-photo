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
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { GestureDetector } from "react-native-gesture-handler";
import { useCanvasGestures } from "../../hooks/useCanvasGestures";
import { COLORS } from "../../theme/colors";

const DEFAULT_IMAGE_URL = "https://example.com/default.jpg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const VIEWPORT_HEIGHT = SCREEN_HEIGHT * 0.55;

interface BaseCanvasProps {
  initialScale?: number;
  onSizeChange?: (size: { width: number; height: number }) => void;
}

export const BaseCanvas: React.FC<BaseCanvasProps> = ({
  initialScale = 1,
  onSizeChange,
}) => {
  // 状态定义
  const [isLoading, setIsLoading] = useState(true);
  const baseImageUri = useEditorStore((state) => state.baseImageUri);
  const userImage = useImage(baseImageUri);
  const defaultImage = useImage(DEFAULT_IMAGE_URL);
  const image = userImage || defaultImage;

  // 直接使用ViewPort尺寸作为Canvas容器尺寸
  const viewportSize = {
    width: SCREEN_WIDTH - 40, // 减去Editor中设置的边距
    height: VIEWPORT_HEIGHT,
  };

  // Canvas尺寸根据图片计算
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  // 图片加载后计算适当尺寸
  useEffect(() => {
    if (image) {
      const imgWidth = image.width();
      const imgHeight = image.height();

      // 计算适合视口的图片尺寸
      const calculatedSize = calculateFitSize(
        imgWidth,
        imgHeight,
        viewportSize.width,
        viewportSize.height
      );

      setCanvasSize(calculatedSize);

      if (onSizeChange) {
        onSizeChange(calculatedSize);
      }

      setIsLoading(false);
    }
  }, [image, onSizeChange]);

  // 使用手势处理
  const { gesture, scale, offset } = useCanvasGestures({
    contentWidth: canvasSize.width,
    contentHeight: canvasSize.height,
    initialScale,
    autoFit: true,
    viewportWidth: viewportSize.width,
    viewportHeight: viewportSize.height,
  });

  // 动画样式
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value.x },
      { translateY: offset.value.y },
      { scale: scale.value },
    ],
  }));

  // 尺寸计算辅助函数
  const calculateFitSize = (
    imageWidth: number,
    imageHeight: number,
    containerWidth: number,
    containerHeight: number
  ) => {
    console.log("计算适配尺寸", {
      imageWidth,
      imageHeight,
      containerWidth,
      containerHeight,
    });

    const imageRatio = imageWidth / imageHeight;
    const containerRatio = containerWidth / containerHeight;

    let finalWidth: number;
    let finalHeight: number;

    if (imageRatio > containerRatio) {
      // 图片更宽，基于容器宽度
      finalWidth = containerWidth * 0.85;
      finalHeight = finalWidth / imageRatio;
    } else {
      // 图片更高，基于容器高度
      finalHeight = containerHeight * 0.85;
      finalWidth = finalHeight * imageRatio;
    }

    return {
      width: finalWidth,
      height: finalHeight,
    };
  };

  // 加载状态渲染
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>加载图像中...</Text>
      </View>
    );
  }

  if (!image) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>无法加载图像</Text>
      </View>
    );
  }

  // 渲染图片内容
  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.canvasContainer, containerStyle]}>
          <Canvas
            style={[
              {
                width: canvasSize.width,
                height: canvasSize.height,
                backgroundColor: "rgba(0, 0, 255, 0.1)",
              },
            ]}
          >
            <Image
              image={image}
              fit="fill"
              x={0}
              y={0}
              width={canvasSize.width}
              height={canvasSize.height}
            />
          </Canvas>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  canvasContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: COLORS.text.secondary,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});
