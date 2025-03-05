import React from "react";
import { Group, Text, SkFont } from "@shopify/react-native-skia";
import { TextLayer } from "../../core/types/canvas";
import { getTextDimensions } from "../../utils/textUtils";

interface TextRendererProps {
  layer: TextLayer;
  font: SkFont;
  isSelected: boolean;
}

export const TextRenderer: React.FC<TextRendererProps> = ({
  layer,
  font,
  isSelected,
}) => {
  const { text, fontSize, color, alignment } = layer;
  const { position, scale, rotation } = layer.transform;

  // 根据文本内容和字体计算尺寸
  const textDimensions = getTextDimensions(text, font, fontSize * scale);

  // 水平对齐偏移
  let alignmentOffset = 0;
  if (alignment === "center") {
    alignmentOffset = -textDimensions.width / 2;
  } else if (alignment === "right") {
    alignmentOffset = -textDimensions.width;
  }

  return (
    <Group
      transform={[
        { translateX: position.x },
        { translateY: position.y },
        { rotate: rotation },
      ]}
      opacity={layer.opacity}
    >
      <Text
        x={alignmentOffset}
        y={0}
        text={text}
        font={font}
        color={color}
        opacity={layer.opacity}
      />
    </Group>
  );
};
