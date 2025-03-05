import React from "react";
import { StyleSheet } from "react-native";
import { Canvas, Group, Path } from "@shopify/react-native-skia";
import { useEditorStore } from "../../store/editorStore";
import { useDrawingStore } from "../../store/drawingStore";

interface DrawingCanvasProps {
  width: number;
  height: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width,
  height,
}) => {
  const { viewTransform } = useEditorStore();
  const { strokes } = useDrawingStore();

  return (
    <Canvas style={[styles.canvas, { width, height }]}>
      <Group
        transform={[
          { translateX: viewTransform.translateX },
          { translateY: viewTransform.translateY },
          { scale: viewTransform.scale },
        ]}
      >
        {/* 这里绘制已保存的笔画 */}
        {/* 简化版本 - 实际会根据strokes绘制路径 */}
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    position: "absolute",
  },
});
