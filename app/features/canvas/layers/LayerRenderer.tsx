import React, { FC } from "react";
import { Group } from "@shopify/react-native-skia";
import { useLayerStore } from "../../../store/useLayerStore";
import { LayerFactory } from "./LayerFactory";

export const LayerRenderer: FC = () => {
  const layers = useLayerStore((state) => state.layers);
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);

  const sortedLayers = Array.from(layers.values()).sort(
    (a, b) => a.zIndex - b.zIndex
  );

  return (
    <Group>
      {sortedLayers.map((layer) => (
        <LayerFactory
          key={layer.id}
          layer={layer}
          isSelected={layer.id === selectedLayerId}
        />
      ))}
    </Group>
  );
};
