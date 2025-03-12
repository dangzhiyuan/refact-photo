import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
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
const VIEWPORT_HEIGHT = SCREEN_HEIGHT * 0.5;

interface BaseCanvasProps {
  initialScale?: number;
  onSizeChange?: (size: { width: number; height: number }) => void;
  isActive?: boolean;
  onDragStart?: () => void;
  onSelect?: () => void;
}

export const BaseCanvas: React.FC<BaseCanvasProps> = ({
  initialScale = 1,
  onSizeChange,
  isActive = false,
  onDragStart,
  onSelect,
}) => {
  const { image, isLoading, hasError, errorMessage, debug } =
    useImageLoader(DEFAULT_IMAGE_URL);

  // 获取editorStore中的变换状态和更新方法
  const setBaseImageUri = useEditorStore((state) => state.setBaseImageUri);
  const baseCanvasTransform = useEditorStore(
    (state) => state.baseCanvasTransform
  );
  const updateBaseCanvasTransform = useEditorStore(
    (state) => state.updateBaseCanvasTransform
  );

  const viewportSize = {
    width: SCREEN_WIDTH - 20,
    height: VIEWPORT_HEIGHT,
  };

  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  const handlePress = useCallback(() => {
    if (onSelect) {
      requestAnimationFrame(() => {
        onSelect();
      });
    }
  }, [onSelect]);

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
      } catch (error) {}
    }
  }, [image, onSizeChange, viewportSize.width, viewportSize.height]);

  // 当变换结束时保存状态到editorStore
  const handleTransformEnd = useCallback(
    (transform: { scale: number; x: number; y: number }) => {
      console.log("保存基础画布变换:", transform);
      updateBaseCanvasTransform({
        scale: transform.scale,
        position: { x: transform.x, y: transform.y },
      });
    },
    [updateBaseCanvasTransform]
  );

  const { gesture, scale, offset } = useCanvasGestures({
    contentWidth: canvasSize.width,
    contentHeight: canvasSize.height,
    initialScale: baseCanvasTransform.scale,
    initialOffset: baseCanvasTransform.position,
    autoFit: image ? false : true, // 仅在没有图像时使用自动适配
    viewportWidth: viewportSize.width,
    viewportHeight: viewportSize.height,
    onDragStart,
    onTransformEnd: handleTransformEnd,
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
    return (
      <LoadingState
        attempts={debug?.loadAttempts || 0}
        format={debug?.format || "unknown"}
      />
    );
  }

  if (hasError || !image) {
    return (
      <ErrorState
        uri={debug?.uri || ""}
        isFileUri={debug?.isFileUri || false}
        format={debug?.format || "unknown"}
        dimensions={
          debug?.dimensions
            ? `${debug.dimensions.width}×${debug.dimensions.height}`
            : "未知"
        }
        errorMessage={errorMessage || "未知错误"}
        onRetry={handleChooseAnotherImage}
      />
    );
  }

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={StyleSheet.absoluteFill}>
          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.canvasContainer, containerStyle]}>
              <CanvasImage
                image={image}
                width={canvasSize.width}
                height={canvasSize.height}
                style={{}}
              />

              {isActive && <View style={styles.activeIndicator} />}
            </Animated.View>
          </GestureDetector>
        </View>
      </TouchableWithoutFeedback>
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
      {attempts > 0 ? `正在尝试 (${attempts}/3)...` : "请稍等片刻..."}
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
  onRetry,
}) => (
  <View style={styles.container}>
    <Text style={styles.errorText}>无法加载图像</Text>
    <Text style={styles.errorSubText}>
      {isFileUri ? "本地图像加载失败" : "网络图像加载失败"}
    </Text>

    <View style={styles.infoContainer}>
      <Text style={styles.infoText}>格式: {format}</Text>
      <Text style={styles.infoText}>尺寸: {dimensions}</Text>
      <Text style={styles.infoText}>错误: {errorMessage}</Text>
    </View>

    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
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
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    width: "90%",
    alignItems: "flex-start",
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: "rgba(0, 0, 255, 0.4)",
    borderRadius: 4,
  },
});
