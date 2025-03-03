import React, { FC } from "react";
import { Text } from "@shopify/react-native-skia";
import { LayerRendererProps } from "../../../../types/renderer";
import { TextLayer } from "../../../../types/layer";
import { BaseRenderer } from "./BaseRenderer";

export const TextLayerRenderer: FC<LayerRendererProps> = ({
  layer,
  isSelected,
}) => {
  const textLayer = layer as TextLayer;
  const { text, fontSize, fontFamily, color } = textLayer;

  return (
    <BaseRenderer layer={layer} isSelected={isSelected}>
      <Text
        x={0}
        y={fontSize}
        text={text}
        font={{ family: fontFamily, size: fontSize }}
        color={color}
      />
    </BaseRenderer>
  );
};
