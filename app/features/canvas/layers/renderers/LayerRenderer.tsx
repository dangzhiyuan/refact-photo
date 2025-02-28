import React, { FC } from "react";
import { Layer } from "../../../../types/layer";
import { ImageLayerRenderer } from "./ImageLayerRenderer";
import { TextLayerRenderer } from "./TextLayerRenderer";
import { DrawLayerRenderer } from "./DrawLayerRenderer";

interface LayerRendererProps {
  layer: Layer;
  isSelected: boolean;
}

export const LayerRenderer: FC<LayerRendererProps> = ({
  layer,
  isSelected,
}) => {
  switch (layer.type) {
    case "image":
      return <ImageLayerRenderer layer={layer} isSelected={isSelected} />;
    case "text":
      return <TextLayerRenderer layer={layer} isSelected={isSelected} />;
    case "draw":
      return <DrawLayerRenderer layer={layer} isSelected={isSelected} />;
    default:
      console.warn(`Unknown layer type: ${(layer as Layer).type}`);
      return null;
  }
};
