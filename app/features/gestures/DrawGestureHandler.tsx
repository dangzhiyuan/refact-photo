import React, { FC, useState } from "react";
import { StyleSheet } from "react-native";
import { Canvas, Path } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue } from "react-native-reanimated";
import { useDrawModeStore } from "../../store/useDrawModeStore";
import { useLayerStore } from "../../store/useLayerStore";
import { v4 as uuidv4 } from "uuid";

export const DrawGestureHandler: FC = () => {
  const isDrawMode = useDrawModeStore((state) => state.isDrawMode);
  const activeColor = useDrawModeStore((state) => state.activeColor);
  const strokeWidth = useDrawModeStore((state) => state.strokeWidth);
  const { addLayer } = useLayerStore();

  // 当前绘制的路径
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const pathBuilder = useSharedValue<string>("");

  // 绘画手势
  const drawGesture = Gesture.Pan()
    .enabled(isDrawMode)
    .onStart((e) => {
      // 开始新路径
      const newPath = `M ${e.x} ${e.y}`;
      pathBuilder.value = newPath;
      setCurrentPath(newPath);
    })
    .onUpdate((e) => {
      // 更新路径
      const updatedPath = `${pathBuilder.value} L ${e.x} ${e.y}`;
      pathBuilder.value = updatedPath;
      setCurrentPath(updatedPath);
    })
    .onEnd(() => {
      // 完成路径，创建新图层
      if (pathBuilder.value) {
        addLayer({
          id: uuidv4(),
          type: "draw",
          zIndex: 10,
          transform: {
            position: { x: 0, y: 0 },
            scale: 1,
            rotation: 0,
          },
          opacity: 1,
          isVisible: true,
          paths: [pathBuilder.value],
          strokeWidth,
          color: activeColor,
        });

        // 重置路径
        pathBuilder.value = "";
        setCurrentPath(null);
      }
    });

  if (!isDrawMode) return null;

  return (
    <GestureDetector gesture={drawGesture}>
      <Animated.View style={styles.container}>
        <Canvas style={styles.canvas}>
          {currentPath && (
            <Path
              path={currentPath}
              style="stroke"
              strokeWidth={strokeWidth}
              color={activeColor}
            />
          )}
        </Canvas>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200, // 确保在其他图层上方
  },
  canvas: {
    flex: 1,
  },
});
