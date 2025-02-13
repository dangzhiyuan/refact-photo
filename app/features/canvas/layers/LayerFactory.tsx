import React, { FC } from "react";
import { Layer } from "../../../types/layer";
import { FilterLayer } from "./FilterLayer";
import { TextLayer } from "./TextLayer"; // 待实现
import { DrawLayer } from "./DrawLayer"; // 待实现

interface LayerFactoryProps {
  layer: Layer;
  isSelected?: boolean;
}

export const LayerFactory: FC<LayerFactoryProps> = ({ layer, isSelected }) => {
  console.log("LayerFactory rendering:", {
    layerId: layer.id,
    type: layer.type,
    isSelected,
  });

  switch (layer.type) {
    case "image":
      return (
        <FilterLayer
          key={`filter-${layer.id}`}
          layer={layer}
          isSelected={isSelected || false}
        />
      );
    case "text":
      // return <TextLayer layer={layer} isSelected={isSelected} />;
      return null;
    case "draw":
      // return <DrawLayer layer={layer} isSelected={isSelected} />;
      return null;
    default:
      return null;
  }
};
