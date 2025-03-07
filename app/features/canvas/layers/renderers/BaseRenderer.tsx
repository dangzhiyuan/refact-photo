import React, { FC } from "react";
import { Group } from "@shopify/react-native-skia";
import { LayerRendererProps } from "../../../../types/renderer";

export const BaseRenderer: FC<LayerRendererProps> = ({
  layer,
  isSelected,
  children,
}) => {
  return (
    <Group
      transform={[
        { translateX: layer.transform.position.x },
        { translateY: layer.transform.position.y },
        { scale: layer.transform.scale },
        { rotate: layer.transform.rotation },
      ]}
      opacity={layer.opacity}
    >
      {children}
    </Group>
  );
};
