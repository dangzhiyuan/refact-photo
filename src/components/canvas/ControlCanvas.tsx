import React from "react";
import { StyleSheet } from "react-native";
import { Canvas, Group } from "@shopify/react-native-skia";

export const ControlCanvas: React.FC = () => {
  return (
    <Canvas style={styles.canvas}>
      <Group>{/* 控制层的渲染逻辑将在后续实现 */}</Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});
