import React from "react";
import { View, StyleSheet } from "react-native";
import { BaseCanvas } from "./canvas/BaseCanvas";
import { DrawingCanvas } from "./canvas/DrawingCanvas";
import { ContentCanvas } from "./canvas/ContentCanvas";
import { ControlCanvas } from "./canvas/ControlCanvas";
import { SimpleDragTest } from "../canvas/SimpleDragTest";

interface CanvasManagerProps {
  activeCanvas: string;
  setActiveCanvas: (canvasType: string) => void;
  initialScale?: number;
  fitScale?: number;
  visibleLayers?: {
    base: boolean;
    drawing: boolean;
    content: boolean;
    control: boolean;
  };
  onCanvasSizeChange?: (size: { width: number; height: number }) => void;
}

export const CanvasManager: React.FC<CanvasManagerProps> = ({
  activeCanvas,
  setActiveCanvas,
  initialScale = 1,
  fitScale = 0.85,
  visibleLayers = { base: true, drawing: true, content: true, control: true },
  onCanvasSizeChange,
}) => {
  return (
    <View style={[styles.container, { height: "100%", width: "100%" }]}>
      <SimpleDragTest />

      {/* 基础图层 */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { opacity: visibleLayers.base ? 1 : 0 },
        ]}
        pointerEvents={
          activeCanvas === "base" && visibleLayers.base ? "auto" : "none"
        }
      >
        <BaseCanvas
          initialScale={initialScale}
          onSizeChange={onCanvasSizeChange}
        />
      </View>

      {/* 绘画图层 */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { opacity: visibleLayers.drawing ? 1 : 0 },
        ]}
        pointerEvents={
          activeCanvas === "drawing" && visibleLayers.drawing ? "auto" : "none"
        }
      ></View>

      {/* 内容图层 */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { opacity: visibleLayers.content ? 1 : 0 },
        ]}
        pointerEvents={
          activeCanvas === "content" && visibleLayers.content ? "auto" : "none"
        }
      >
        <ContentCanvas initialScale={initialScale} />
      </View>

      {/* 控制图层 */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { opacity: visibleLayers.control ? 1 : 0 },
        ]}
        pointerEvents={
          activeCanvas === "control" && visibleLayers.control ? "auto" : "none"
        }
      >
        <ControlCanvas />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
});
