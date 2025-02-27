import React, { FC } from "react";
import { Text } from "@shopify/react-native-skia";
import { TextLayer } from "../../../../types/layer";
import { BaseRenderer } from "./BaseRenderer";

interface TextRendererProps {
  layer: TextLayer;
  isSelected: boolean;
}

export const TextRenderer: FC<TextRendererProps> = ({ layer, isSelected }) => {
  const textLayer = layer as TextLayer;

  return (
    <BaseRenderer layer={layer} isSelected={isSelected}>
      <Text
        x={0}
        y={0}
        text={textLayer.text}
        font={{ size: textLayer.fontSize }}
        color={textLayer.color}
      />
    </BaseRenderer>
  );
};
