import React, { FC } from "react";
import { Group } from "@shopify/react-native-skia";
import { useLayerStore } from "../../../store/useLayerStore";
import { LayerFactory } from "./LayerFactory";

export const LayerRenderer: FC = () => {
  const { layers, selectedLayerId } = useLayerStore();

  return (
    <Group>
      {layers
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((layer) => (
          <LayerFactory
            key={layer.id}
            layer={layer}
            isSelected={layer.id === selectedLayerId}
          />
        ))}
    </Group>
  );
};
