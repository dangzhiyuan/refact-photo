import React from "react";
import { Group, Image, useImage } from "@shopify/react-native-skia";
import { StickerLayer } from "../../core/types/canvas";

interface StickerRendererProps {
  layer: StickerLayer;
  isSelected: boolean;
}

export const StickerRenderer: React.FC<StickerRendererProps> = ({
  layer,
  isSelected,
}) => {
  const { stickerUri } = layer;
  const { position, scale, rotation } = layer.transform;

  // 加载贴纸图像
  const image = useImage(stickerUri);

  if (!image) {
    return null;
  }

  // 计算尺寸
  const width = image.width() * scale;
  const height = image.height() * scale;

  return (
    <Group
      transform={[
        { translateX: position.x },
        { translateY: position.y },
        { rotate: rotation },
      ]}
      opacity={layer.opacity}
    >
      <Image
        image={image}
        x={0}
        y={0}
        width={width}
        height={height}
        fit="contain"
      />
    </Group>
  );
};
