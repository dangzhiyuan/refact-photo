import React from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, Circle } from "@shopify/react-native-skia";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useCanvasGestures } from "../../hooks/useCanvasGestures";

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
}

export const ContentCanvas: React.FC<ContentCanvasProps> = ({
  initialScale = 1,
}) => {
  const { gesture, scale, offset, isActive } = useCanvasGestures({
    contentWidth: CANVAS_WIDTH,
    contentHeight: CANVAS_HEIGHT,
    initialScale: initialScale,
    autoFit: true,
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value.x },
      { translateY: offset.value.y },
      { scale: scale.value },
    ],
  }));

  return (
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
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
  },
  canvas: {},
});
