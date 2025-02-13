import React, { FC } from "react";
import { Group, Text } from "@shopify/react-native-skia";
import { TextLayer as TextLayerType } from "../../../types/layer";

interface TextLayerProps {
  layer: TextLayerType;
  isSelected: boolean;
}

export const TextLayer: FC<TextLayerProps> = ({ layer, isSelected }) => {
  return (
    <Group
      transform={[
        { translateX: layer.position.x },
        { translateY: layer.position.y },
        { scale: layer.scale },
        { rotate: layer.rotation },
      ]}
    >
      <Text
        text={layer.text}
        x={0}
        y={0}
        size={layer.fontSize}
        color={layer.color}
        font={layer.font}
      />
    </Group>
  );
};
