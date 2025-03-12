import React, { useCallback } from "react";
import { StyleSheet, View, TouchableWithoutFeedback } from "react-native";
import { Canvas, Circle } from "@shopify/react-native-skia";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useCanvasGestures } from "../../hooks/useCanvasGestures";
import { useEditorStore } from "../../store/editorStore";

const CIRCLE_CONFIG = {
  radius: 50,
  x: 100,
  y: 100,
  color: "#FF5722",
};

const CANVAS_WIDTH = CIRCLE_CONFIG.x + CIRCLE_CONFIG.radius * 2;
const CANVAS_HEIGHT = CIRCLE_CONFIG.y + CIRCLE_CONFIG.radius * 2;

interface ContentCanvasProps {
  initialScale?: number;
  isActive?: boolean;
  onDragStart?: () => void;
  onSelect?: () => void;
}

export const ContentCanvas: React.FC<ContentCanvasProps> = ({
  initialScale = 1,
  isActive = false,
  onDragStart,
  onSelect,
}) => {
  // 获取editorStore中的变换状态和更新方法
  const contentCanvasTransform = useEditorStore(
    (state) => state.contentCanvasTransform
  );
  const updateContentCanvasTransform = useEditorStore(
    (state) => state.updateContentCanvasTransform
  );

  // 当变换结束时保存状态到editorStore
  const handleTransformEnd = useCallback(
    (transform: { scale: number; x: number; y: number }) => {
      console.log("保存内容画布变换:", transform);
      updateContentCanvasTransform({
        scale: transform.scale,
        position: { x: transform.x, y: transform.y },
      });
    },
    [updateContentCanvasTransform]
  );

  const {
    gesture,
    scale,
    offset,
    isActive: gestureActive,
  } = useCanvasGestures({
    contentWidth: CANVAS_WIDTH,
    contentHeight: CANVAS_HEIGHT,
    initialScale: contentCanvasTransform.scale,
    initialOffset: contentCanvasTransform.position,
    autoFit: false, // 使用存储的变换状态，不自动适配
    onDragStart,
    onTransformEnd: handleTransformEnd,
  });

  const handlePress = useCallback(() => {
    if (onSelect) {
      requestAnimationFrame(() => {
        onSelect();
      });
    }
  }, [onSelect]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value.x },
      { translateY: offset.value.y },
      { scale: scale.value },
    ],
  }));

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={StyleSheet.absoluteFill}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.container, animatedStyle]}>
            <Canvas
              style={[
                styles.canvas,
                { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
              ]}
            >
              <Circle
                cx={CIRCLE_CONFIG.x}
                cy={CIRCLE_CONFIG.y}
                r={CIRCLE_CONFIG.radius}
                color={CIRCLE_CONFIG.color}
              />
            </Canvas>

            {isActive && <View style={styles.activeIndicator} />}
          </Animated.View>
        </GestureDetector>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
  },
  canvas: {},
  activeIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: "rgba(255, 87, 34, 0.5)",
    borderRadius: 4,
  },
});
