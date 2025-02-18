import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useLayerStore } from "../../../../store/useLayerStore";
import { FilterPanel } from "./FilterPanel";
import { LutType } from "../../../../types/filter";
import { ImageLayer } from "../../../../types/layer";

export const FilterMenu = () => {
  const { selectedLayerId, layers, updateLayer } = useLayerStore();

  // 获取选中的图层
  const selectedLayer = layers.find(
    (layer): layer is ImageLayer =>
      layer.id === selectedLayerId && layer.type === "image"
  );

  // 从当前图层获取初始滤镜状态
  const [selectedFilter, setSelectedFilter] = useState<LutType>("normal");
  const [intensity, setIntensity] = useState(1);

  // 当选中图层变化时，更新滤镜状态
  useEffect(() => {
    if (selectedLayer) {
      setSelectedFilter(selectedLayer.filterType || "normal");
      setIntensity(selectedLayer.filterIntensity || 1);
    }
  }, [selectedLayer]);

  // 处理滤镜变化
  const handleFilterChange = (type: LutType, value: number) => {
    if (!selectedLayerId) return;

    // 更新本地状态
    setSelectedFilter(type);
    setIntensity(value);

    // 更新图层
    updateLayer(selectedLayerId, {
      filterType: type,
      filterIntensity: value,
    });
  };

  // 如果没有选中图片图层，不显示滤镜面板
  if (!selectedLayer) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FilterPanel
        selectedFilter={selectedFilter}
        intensity={intensity}
        onFilterChange={handleFilterChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 8,
  },
});
