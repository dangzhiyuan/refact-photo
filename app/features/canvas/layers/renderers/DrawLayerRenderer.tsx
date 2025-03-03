import React, { FC } from "react";
import { Path } from "@shopify/react-native-skia";
import { LayerRendererProps } from "../../../../types/renderer";
import { DrawLayer } from "../../../../types/layer";
import { BaseRenderer } from "./BaseRenderer";

export const DrawLayerRenderer: FC<LayerRendererProps> = ({
  layer,
  isSelected,
}) => {
  const drawLayer = layer as DrawLayer;
  const { paths, strokeWidth, color } = drawLayer;

  return (
    <BaseRenderer layer={layer} isSelected={isSelected}>
      {paths.map((path, index) => (
        <Path
          key={index}
          path={path}
          style="stroke"
          strokeWidth={strokeWidth}
          color={color}
        />
      ))}
    </BaseRenderer>
  );
};
