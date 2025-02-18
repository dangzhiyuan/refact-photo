import React, { FC } from "react";
import { Group, Text, Skia } from "@shopify/react-native-skia";
import { TextLayer as TextLayerType } from "../../../types/layer";

interface TextLayerProps {
  layer: TextLayerType;
  isSelected: boolean;
}

export const TextLayer: FC<TextLayerProps> = ({ layer, isSelected }) => {
  const { text, transform, opacity, color, fontSize } = layer;

  // 创建默认字体
  const defaultFont = Skia.Font(undefined, fontSize);

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
      <Text text={text} x={0} y={0} color={color} font={defaultFont} />
    </Group>
  );
};
