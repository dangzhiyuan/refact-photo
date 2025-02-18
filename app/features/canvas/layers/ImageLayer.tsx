import React from "react";
import { Group, Image } from "@shopify/react-native-skia";
import { ImageLayer } from "../../../types/layer";

interface ImageLayerProps {
  layer: ImageLayer;
  isSelected: boolean;
}

export const ImageLayerComponent = ({ layer }: ImageLayerProps) => {
  const { imageSource, transform, opacity, filterType } = layer;

  console.log("Rendering image layer:", layer.id, filterType); // 添加日志

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
      <Image
        image={imageSource}
        width={imageSource.width()}
        height={imageSource.height()}
        fit="contain"
      />
    </Group>
  );
};
