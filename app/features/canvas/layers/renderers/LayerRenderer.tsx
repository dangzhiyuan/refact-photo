import React, { FC } from "react";
import { Layer } from "../../../../types/layer";
import { ImageRenderer } from "./ImageRenderer";
// 暂时注释掉未创建的渲染器导入
// import { TextRenderer } from "./TextRenderer";
// import { DrawRenderer } from "./DrawRenderer";

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
      return <ImageRenderer layer={layer} isSelected={isSelected} />;
    // 暂时返回 null，直到实现对应的渲染器
    case "text":
      // return <TextRenderer layer={layer} isSelected={isSelected} />;
      return null;
    case "draw":
      // return <DrawRenderer layer={layer} isSelected={isSelected} />;
      return null;
    default:
      console.warn(`Unknown layer type: ${(layer as Layer).type}`);
      return null;
  }
};
