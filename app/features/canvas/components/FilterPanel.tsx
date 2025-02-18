import { useState, useEffect } from "react";
import { FilterPanel } from "../../tools/filters/components/FilterPanel";
import { useLayerStore } from "../../../store/useLayerStore";
import { FilterName } from "../../tools/filters/shaders/FilterShader";
import { getImagePreviewUri } from "../../../utils/imageUtils";

export const CanvasFilterPanel = () => {
  const { selectedLayerId, updateLayer, layers } = useLayerStore();
  const [previewUri, setPreviewUri] = useState<string>("");

  // 获取选中图层
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);

  // 只有选中图片图层时才显示滤镜面板
  if (!selectedLayer || selectedLayer.type !== "image") {
    return null;
  }

  // 当选中图层变化时，更新预览 URI
  useEffect(() => {
    if (selectedLayer.type === "image") {
      getImagePreviewUri(selectedLayer.imageSource).then(setPreviewUri);
    }
  }, [selectedLayer]);

  const handleFilterChange = (filterType: FilterName, intensity: number) => {
    if (selectedLayerId) {
      updateLayer(selectedLayerId, {
        filterType,
        filterIntensity: intensity,
      });
    }
  };

  // 等待预览 URI 准备好
  if (!previewUri) {
    return null;
  }

  return (
    <FilterPanel imageUri={previewUri} onFilterChange={handleFilterChange} />
  );
};
