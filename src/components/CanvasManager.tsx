import React from "react";
import { View, StyleSheet } from "react-native";
import { BaseCanvas } from "./canvas/BaseCanvas";
import { ContentCanvas } from "./canvas/ContentCanvas";
import { StickerCanvas } from "./canvas/StickerCanvas";
import { LayerVisibility } from "../hooks/useLayerVisibility";
import { useCanvasStore } from "../store/canvasStore";
import { LayerType } from "../core/types/canvas";

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
  visibleLayers = { base: true, content: true },
  onCanvasSizeChange,
}) => {
  const { layers, layerIds } = useCanvasStore();

  const stickerLayers = layerIds.filter(
    (id) => layers[id] && layers[id].type === LayerType.STICKER
  );

  const handleCanvasSelect = (canvasId: string) => {
    if (canvasId !== activeCanvas) {
      setActiveCanvas(canvasId);
    }
  };

  const handleCanvasDragStart = (canvasId: string) => {
    if (canvasId !== activeCanvas) {
      setActiveCanvas(canvasId);
    }
  };

  return (
    <View style={[styles.container, { height: "100%", width: "100%" }]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { opacity: visibleLayers.base ? 1 : 0 },
          { zIndex: 1 }
        ]}
        pointerEvents={visibleLayers.base ? "auto" : "none"}
      >
        <BaseCanvas
          initialScale={initialScale}
          onSizeChange={onCanvasSizeChange}
          isActive={activeCanvas === "base"}
          onDragStart={() => handleCanvasDragStart("base")}
          onSelect={() => handleCanvasSelect("base")}
        />
      </View>

      <View
        style={[
          StyleSheet.absoluteFill,
          { opacity: visibleLayers.content ? 1 : 0 },
          { zIndex: 2 }
        ]}
        pointerEvents={visibleLayers.content ? "auto" : "none"}
      >
        <ContentCanvas 
          initialScale={initialScale} 
          isActive={activeCanvas === "content"}
          onDragStart={() => handleCanvasDragStart("content")}
          onSelect={() => handleCanvasSelect("content")}
        />
      </View>

      {stickerLayers.map((layerId) => (
        <View
          key={layerId}
          style={[
            StyleSheet.absoluteFill,
            { opacity: visibleLayers[layerId] !== false ? 1 : 0 },
            { zIndex: 3 }
          ]}
          pointerEvents="box-none"
        >
          <StickerCanvas
            layerId={layerId}
            initialScale={initialScale}
            isActive={activeCanvas === layerId}
            onSelect={setActiveCanvas}
            onDelete={(id) => {
              if (activeCanvas === id) {
                setActiveCanvas("base");
              }
            }}
          />
        </View>
      ))}
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
