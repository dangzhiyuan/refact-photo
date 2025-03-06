import React, { useEffect, useState } from "react";
import { StyleSheet, Dimensions, View, Text } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useCanvasGestures } from "../../hooks/useCanvasGestures";
import { COLORS } from "../../theme/colors";
import { useImageLoader } from "../../hooks/useImageLoader";
import { calculateFitSize } from "../../utils/canvasUtils";
import { CanvasImage } from "./CanvasImage";

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
  const { image, isLoading } = useImageLoader(DEFAULT_IMAGE_URL);

  const viewportSize = {
    width: SCREEN_WIDTH - 40,
    height: VIEWPORT_HEIGHT,
  };

  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (image) {
      const imgWidth = image.width();
      const imgHeight = image.height();

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
    }
  }, [image, onSizeChange, viewportSize.width, viewportSize.height]);

  const { gesture, scale, offset } = useCanvasGestures({
    contentWidth: canvasSize.width,
    contentHeight: canvasSize.height,
    initialScale,
    autoFit: true,
    viewportWidth: viewportSize.width,
    viewportHeight: viewportSize.height,
  });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value.x },
      { translateY: offset.value.y },
      { scale: scale.value },
    ],
  }));

  if (isLoading) {
    return <LoadingState />;
  }

  if (!image) {
    return <ErrorState />;
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.canvasContainer, containerStyle]}>
          <CanvasImage
            image={image}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{ backgroundColor: "rgba(0, 0, 255, 0.1)" }}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const LoadingState = () => (
  <View style={styles.container}>
    <Text style={styles.loadingText}>加载图像中...</Text>
  </View>
);

const ErrorState = () => (
  <View style={styles.container}>
    <Text style={styles.errorText}>无法加载图像</Text>
  </View>
);

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
