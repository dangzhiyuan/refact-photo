import React, { FC, useMemo } from "react";
import { Group, Image } from "@shopify/react-native-skia";
import { ImageLayer } from "../../../types/layer";
import { calculateFitSize } from "../../../utils/layoutUtils";

interface FilterLayerProps {
  layer: ImageLayer;
  isSelected: boolean;
}

export const FilterLayer: FC<FilterLayerProps> = ({ layer, isSelected }) => {
  const { imageSource, transform, opacity, isVisible } = layer;

  // 如果图层不可见或没有图片源，返回 null
  if (!isVisible || !imageSource) {
    return null;
  }

  // 计算适配尺寸
  const fitSize = useMemo(() => {
    return calculateFitSize(imageSource.width(), imageSource.height());
  }, [imageSource]);

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
        fit="contain"
        width={fitSize.width}
        height={fitSize.height}
      />
    </Group>
  );
};
