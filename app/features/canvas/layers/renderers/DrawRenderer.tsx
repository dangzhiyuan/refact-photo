import React, { FC } from "react";
import { Path } from "@shopify/react-native-skia";
import { DrawLayer } from "../../../../types/layer";
import { BaseRenderer } from "./BaseRenderer";

interface DrawRendererProps {
  layer: DrawLayer;
  isSelected: boolean;
}

export const DrawRenderer: FC<DrawRendererProps> = ({ layer, isSelected }) => {
  const drawLayer = layer as DrawLayer;

  return (
    <BaseRenderer layer={layer} isSelected={isSelected}>
      {drawLayer.paths.map((path, index) => (
        <Path
          key={index}
          path={path}
          color={drawLayer.color}
          style="stroke"
          strokeWidth={drawLayer.strokeWidth}
        />
      ))}
    </BaseRenderer>
  );
};
