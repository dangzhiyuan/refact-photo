import React, { FC } from "react";
import { Group } from "@shopify/react-native-skia";
import { LayerRendererProps } from "../../../../types/renderer";
import { FilterLayer } from "../../../../types/layer";

export const FilterLayerRenderer: FC<LayerRendererProps> = ({
  layer,
  isSelected,
}) => {
  const filterLayer = layer as FilterLayer;

  // 需要重新设计滤镜的实现方式
  return (
    <Group
      transform={[
        { translateX: layer.transform.position.x },
        { translateY: layer.transform.position.y },
        { scale: layer.transform.scale },
        { rotate: layer.transform.rotation },
      ]}
    >
      {/* 临时移除滤镜，后续重新实现 */}
    </Group>
  );
};
