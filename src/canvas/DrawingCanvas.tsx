import React from "react";
import { StyleSheet } from "react-native";
import { Canvas, Group } from "@shopify/react-native-skia";
import { useEditorStore } from "../store/editorStore";
import { EditorMode } from "../core/types/canvas";

/**
 * 绘图画布组件 - 简化版
 * 当前版本仅保留基本结构，绘图功能将在后续开发
 */
export const DrawingCanvas: React.FC = () => {
  const currentMode = useEditorStore((state) => state.currentMode);

  // 如果不是绘图模式，不渲染或渲染空画布
  if (currentMode !== EditorMode.DRAW) {
    return null;
  }

  // 渲染基本画布结构，等待后续实现绘图功能
  return (
    <Canvas style={styles.canvas}>
      <Group>{/* 绘图内容将在这里实现 */}</Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});
