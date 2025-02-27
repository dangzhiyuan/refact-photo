import React, { FC } from "react";
import { Group, Path } from "@shopify/react-native-skia";
import { LayerRendererProps } from "../../../../types/renderer";
import { DrawLayer } from "../../../../types/layer";

export const DrawLayerRenderer: FC<LayerRendererProps> = ({
  layer,
  isSelected,
}) => {
  const drawLayer = layer as DrawLayer;
  const { paths, color, strokeWidth, transform, opacity } = drawLayer;

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
      {paths.map((path, index) => (
        <Path
          key={index}
          path={path}
          color={color}
          style="stroke"
          strokeWidth={strokeWidth}
        />
      ))}
    </Group>
  );
};
