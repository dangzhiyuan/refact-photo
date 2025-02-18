import React, { FC } from "react";
import { Group, Path } from "@shopify/react-native-skia";
import { DrawLayer as DrawLayerType } from "../../../types/layer";

interface DrawLayerProps {
  layer: DrawLayerType;
  isSelected: boolean;
}

export const DrawLayer: FC<DrawLayerProps> = ({ layer, isSelected }) => {
  const { paths, transform, opacity, color, strokeWidth } = layer;

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
