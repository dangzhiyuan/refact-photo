import React, { FC } from "react";
import { Group, TouchHandler } from "@shopify/react-native-skia";
import { useLayerStore } from "../../../store/useLayerStore";
import { LayerFactory } from "../layers/LayerFactory";

export const LayerRenderer: FC = () => {
  const { layers, selectedLayerId, setSelectedLayer } = useLayerStore();

  // 处理图层点击
  const handleLayerTouch: TouchHandler = (touchInfo) => {
    const { x, y } = touchInfo;

    // 从上到下遍历图层，找到第一个被点击的图层
    const hitLayer = [...layers]
      .sort((a, b) => b.zIndex - a.zIndex)
      .find((layer) => {
        if (!layer.isVisible) return false;
        // 检查点击是否在图层范围内
        return isPointInLayer(x, y, layer);
      });

    if (hitLayer) {
      setSelectedLayer(hitLayer.id);
    } else {
      setSelectedLayer(null);
    }
  };

  return (
    <Group onTouchStart={handleLayerTouch}>
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
