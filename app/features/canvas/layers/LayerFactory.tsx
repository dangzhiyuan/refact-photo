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
  // 添加错误边界
  try {
    console.log("LayerFactory rendering:", {
      layerId: layer.id,
      type: layer.type,
      isSelected,
      position: layer.position,
      scale: layer.scale
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
        return null; // 暂时返回 null
      case "draw":
        return null; // 暂时返回 null
      default:
        return null;
    }
  } catch (error) {
    console.error("Error in LayerFactory:", error);
    return null;
  }
};
