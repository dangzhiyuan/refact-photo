import React, { FC } from "react";
import { StyleSheet } from "react-native";
import { Canvas, Group } from "@shopify/react-native-skia";

export const DecorationCanvas: FC = () => {
  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Group>{/* 后续实现 */}</Group>
    </Canvas>
  );
};
