import React, { FC, useMemo } from "react";
import { Group } from "@shopify/react-native-skia";
import { useLayerStore } from "../../../store/useLayerStore";
import { LayerFactory } from "./LayerFactory";
import { useTempPositionStore } from "../../../store/useTempPositionStore";

export const LayerRenderer: FC = () => {
  // 获取所有图层并排序
  const layers = useLayerStore((state) => state.layers);
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);

  // 获取临时位置信息
  const tempPositions = useTempPositionStore((state) => state.positions);
  const draggingLayers = useTempPositionStore((state) => state.draggingLayers);

  const sortedLayers = useMemo(() => {
    return Array.from(layers.values()).sort((a, b) => a.zIndex - b.zIndex);
  }, [layers]);

  return (
    <Group>
      {sortedLayers.map((layer) => {
        // 检查是否有临时位置以实现实时拖动效果
        const tempPosition = tempPositions[layer.id];
        const isDragging = draggingLayers.has(layer.id);

        // 如果图层正在拖动并且有临时位置，创建带有临时位置的图层副本
        const renderedLayer =
          isDragging && tempPosition
            ? {
                ...layer,
                transform: {
                  ...layer.transform,
                  position: tempPosition,
                },
              }
            : layer;

        return (
          <LayerFactory
            key={layer.id}
            layer={renderedLayer}
            isSelected={layer.id === selectedLayerId}
          />
        );
      })}
    </Group>
  );
};
