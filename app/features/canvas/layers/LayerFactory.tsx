import React, { FC } from "react";
import { Layer } from "../../../types/layer";
import { useLayerRendererStore } from "../../../store/useLayerRendererStore";

interface LayerFactoryProps {
  layer: Layer;
  isSelected: boolean;
}

export const LayerFactory: FC<LayerFactoryProps> = ({ layer, isSelected }) => {
  const getRenderer = useLayerRendererStore((state) => state.getRenderer);
  const Renderer = getRenderer(layer.type);

  if (!Renderer) {
    console.warn(`No renderer found for layer type: ${layer.type}`);
    return null;
  }

  return <Renderer layer={layer} isSelected={isSelected} />;
};
