import React, { FC } from "react";
import { StyleSheet } from "react-native";
import { Canvas, Path, Group } from "@shopify/react-native-skia";
import { GestureDetector } from "react-native-gesture-handler";
import { useDrawStore } from "../../../store/useDrawStore";
import { useDrawGestures } from "../../../hooks/draw/useDrawGestures";

export const DrawCanvas: FC = () => {
  const { paths, currentPath, color, strokeWidth } = useDrawStore();
  const { gesture } = useDrawGestures();

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Group>
          {paths.map((path, index) => (
            <Path
              key={index}
              path={path}
              color={color}
              style="stroke"
              strokeWidth={strokeWidth}
            />
          ))}
          {currentPath && (
            <Path
              path={currentPath}
              color={color}
              style="stroke"
              strokeWidth={strokeWidth}
            />
          )}
        </Group>
      </Canvas>
    </GestureDetector>
  );
};
