import React, { useEffect, useState } from "react";
import { StyleSheet, Dimensions, View, Text, TouchableOpacity } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useCanvasGestures } from "../../hooks/useCanvasGestures";
import { COLORS } from "../../theme/colors";
import { useImageLoader } from "../../hooks/useImageLoader";
import { calculateFitSize } from "../../utils/canvasUtils";
import { CanvasImage } from "./CanvasImage";
import { useEditorStore } from "../../store/editorStore";

const DEFAULT_IMAGE_URL = "https://example.com/default.jpg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const VIEWPORT_HEIGHT = SCREEN_HEIGHT * 0.4;

interface BaseCanvasProps {
  initialScale?: number;
  onSizeChange?: (size: { width: number; height: number }) => void;
  isActive?: boolean;
  onDragStart?: () => void;
}

export const BaseCanvas: React.FC<BaseCanvasProps> = ({
  initialScale = 1,
  onSizeChange,
  isActive = false,
  onDragStart,
}) => {
  const { image, isLoading, hasError, errorMessage, debug } = useImageLoader(DEFAULT_IMAGE_URL);
  const setBaseImageUri = useEditorStore((state) => state.setBaseImageUri);

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
      try {
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
      } catch (error) {
        // 无需输出错误
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
    onDragStart
  });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value.x },
      { translateY: offset.value.y },
      { scale: scale.value },
    ],
  }));

  const handleChooseAnotherImage = () => {
    setBaseImageUri("");
  };

  if (isLoading) {
    return <LoadingState attempts={debug?.loadAttempts || 0} format={debug?.format || 'unknown'} />;
  }

  if (hasError || !image) {
    return (
      <ErrorState 
        uri={debug?.uri || ''} 
        isFileUri={debug?.isFileUri || false} 
        format={debug?.format || 'unknown'}
        dimensions={debug?.dimensions ? `${debug.dimensions.width}×${debug.dimensions.height}` : '未知'}
        errorMessage={errorMessage || '未知错误'} 
        onRetry={handleChooseAnotherImage}
      />
    );
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

interface LoadingStateProps {
  attempts: number;
  format: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ attempts, format }) => (
  <View style={styles.container}>
    <Text style={styles.loadingText}>加载图像中...</Text>
    <Text style={styles.loadingSubText}>
      {attempts > 0 
        ? `正在尝试 (${attempts}/3)...`
        : '请稍等片刻...'}
    </Text>
    <Text style={styles.infoText}>图像格式: {format}</Text>
  </View>
);

interface ErrorStateProps {
  uri: string;
  isFileUri: boolean;
  format: string;
  dimensions: string;
  errorMessage: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  uri, 
  isFileUri, 
  format,
  dimensions,
  errorMessage, 
  onRetry
}) => (
  <View style={styles.container}>
    <Text style={styles.errorText}>无法加载图像</Text>
    <Text style={styles.errorSubText}>
      {isFileUri 
        ? '本地图像加载失败' 
        : '网络图像加载失败'}
    </Text>
    
    <View style={styles.infoContainer}>
      <Text style={styles.infoText}>格式: {format}</Text>
      <Text style={styles.infoText}>尺寸: {dimensions}</Text>
      <Text style={styles.infoText}>错误: {errorMessage}</Text>
    </View>
    
    <TouchableOpacity 
      style={styles.retryButton}
      onPress={onRetry}
    >
      <Text style={styles.retryButtonText}>返回选择其他图像</Text>
    </TouchableOpacity>
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
    fontWeight: "bold",
    marginBottom: 8,
  },
  loadingSubText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    marginBottom: 8,
  },
  infoContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    width: '90%',
    alignItems: 'flex-start',
  },
  infoText: {
    color: COLORS.text.secondary,
    fontSize: 12,
    marginVertical: 2,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  errorSubText: {
    color: "red",
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    width: '90%',
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  }
});
