import React from "react";
import { StyleSheet } from "react-native";
import { Canvas, Group, useFont } from "@shopify/react-native-skia";
import { useCanvasStore } from "../store/canvasStore";
import { LayerType, TextLayer, StickerLayer } from "../core/types/canvas";
import { TextRenderer } from "../components/layers/TextRenderer";
import { StickerRenderer } from "../components/layers/StickerRenderer";

export const ContentCanvas: React.FC = () => {
  // 获取内容图层
  const contentLayers = useCanvasStore((state) => {
    return Object.values(state.layers).filter(
      (layer) =>
        layer.type === LayerType.TEXT || layer.type === LayerType.STICKER
    );
  });

  const selectedLayerId = useCanvasStore((state) => state.selectedLayerId);

  // 加载字体
  const font = useFont("Arial", 24);

  if (!font) {
    return null;
  }

  return (
    <Canvas style={styles.canvas}>
      <Group>
        {contentLayers.map((layer) => {
          const isSelected = layer.id === selectedLayerId;

          switch (layer.type) {
            case LayerType.TEXT:
              return (
                <TextRenderer
                  key={layer.id}
                  layer={layer as TextLayer}
                  font={font}
                  isSelected={isSelected}
                />
              );
            case LayerType.STICKER:
              return (
                <StickerRenderer
                  key={layer.id}
                  layer={layer as StickerLayer}
                  isSelected={isSelected}
                />
              );
            default:
              return null;
          }
        })}
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});
