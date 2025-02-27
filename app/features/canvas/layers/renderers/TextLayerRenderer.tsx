import React, { FC } from "react";
import { Group, Text, Skia } from "@shopify/react-native-skia";
import { LayerRendererProps } from "../../../../types/renderer";
import { TextLayer } from "../../../../types/layer";

export const TextLayerRenderer: FC<LayerRendererProps> = ({
  layer,
  isSelected,
}) => {
  const textLayer = layer as TextLayer;
  const { text, transform, opacity, color, fontSize } = textLayer;

  const font = Skia.Font(undefined, fontSize);

  return (
    <Group
      transform={[
        { translateX: transform.position.x },
        { translateY: transform.position.y },
        { scale: transform.scale },
        { rotate: transform.rotation },
      ]}
      opacity={opacity}
    >
      <Text x={0} y={0} text={text} font={font} color={color} />
    </Group>
  );
};
