import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { BaseCanvas } from "./canvas/BaseCanvas";
import { DrawingCanvas } from "./canvas/DrawingCanvas";
import { ContentCanvas } from "./canvas/ContentCanvas";
import { ControlCanvas } from "./canvas/ControlCanvas";
import { StickerCanvas } from "./canvas/StickerCanvas";
import { LayerVisibility } from "../hooks/useLayerVisibility";
import { SimpleDragTest } from "../temptools/SimpleDragTest";
import { useCanvasStore } from "../store/canvasStore";
import { CanvasType, LayerType } from "../core/types/canvas";
import { SelectionFrame } from "./common/SelectionFrame";

interface CanvasManagerProps {
  activeCanvas: string;
  setActiveCanvas: (canvasType: string) => void;
  initialScale?: number;
  fitScale?: number;
  visibleLayers?: LayerVisibility;
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
  // 使用 canvasStore 获取贴纸图层
  const { layers, layerIds } = useCanvasStore();

  // 过滤出贴纸类型的图层
  const stickerLayers = layerIds.filter(
    (id) => layers[id] && layers[id].type === LayerType.STICKER
  );

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

      {/* 贴纸图层 */}
      {stickerLayers.map((layerId) => (
        <View
          key={layerId}
          style={[
            StyleSheet.absoluteFill,
            { opacity: visibleLayers[layerId] !== false ? 1 : 0 },
          ]}
          pointerEvents="box-none"
        >
          <StickerCanvas
            layerId={layerId}
            initialScale={initialScale}
            isActive={activeCanvas === layerId}
            onSelect={setActiveCanvas}
            onDelete={(id) => {
              // 如果删除的是当前选中的图层，选中基础图层
              if (activeCanvas === id) {
                setActiveCanvas("base");
              }
            }}
          />
        </View>
      ))}

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
