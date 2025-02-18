import React, { FC } from "react";
import { Layer } from "../../../types/layer";
import { FilterLayer } from "./FilterLayer";
import { TextLayer } from "./TextLayer";
import { DrawLayer } from "./DrawLayer";

interface LayerFactoryProps {
  layer: Layer;
  isSelected: boolean;
}

export const LayerFactory: FC<LayerFactoryProps> = ({ layer, isSelected }) => {
  console.log("LayerFactory rendering:", {
    layerId: layer.id,
    type: layer.type,
    isSelected,
  });

  switch (layer.type) {
    case "image":
      return <FilterLayer layer={layer} isSelected={isSelected} />;
    case "text":
      return <TextLayer layer={layer} isSelected={isSelected} />;
    case "draw":
      return <DrawLayer layer={layer} isSelected={isSelected} />;
    default:
      return null;
  }
};
