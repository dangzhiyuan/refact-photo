import React, { FC } from "react";
import { StyleSheet } from "react-native";
import { Canvas, Group } from "@shopify/react-native-skia";

export const TextCanvas: FC = () => {
  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Group>{/* 文字渲染内容将在这里添加 */}</Group>
    </Canvas>
  );
};
