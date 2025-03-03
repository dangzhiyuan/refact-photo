import React, { FC, useMemo } from "react";
import { Group } from "@shopify/react-native-skia";
import { useLayerStore } from "../../../store/useLayerStore";
import { LayerFactory } from "./LayerFactory";

export const LayerRenderer: FC = () => {
  // 获取所有图层并排序
  const layers = useLayerStore((state) => state.layers);
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);

  const sortedLayers = useMemo(() => {
    return Array.from(layers.values()).sort((a, b) => a.zIndex - b.zIndex);
  }, [layers]);

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
