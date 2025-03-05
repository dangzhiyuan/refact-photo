import React from "react";
import { StyleSheet } from "react-native";
import { Canvas, Group } from "@shopify/react-native-skia";

export const ContentCanvas: React.FC = () => {
  return (
    <Canvas style={styles.canvas}>
      <Group>{/* 内容层的渲染逻辑将在后续实现 */}</Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});
