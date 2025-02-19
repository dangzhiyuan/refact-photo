import React, { useCallback } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useLayerStore } from "../../../../store/useLayerStore";
import { FilterPreview } from "../../filters/components/FilterPreview";
import { IntensitySlider } from "../../filters/components/IntensitySlider";
import { ImageLayer } from "../../../../types/layer";
import { filterEngine } from "../../filters/FilterEngine";
import { LutType } from "../../../../assets/luts";
import { FILTER_PRESETS } from "../../../../types/filter";

interface FilterPanelProps {
  onClose: () => void;
}

// 获取可能的下一个滤镜
const getNextPossibleFilters = (currentType: LutType): LutType[] => {
  const filterTypes = Object.keys(FILTER_PRESETS) as LutType[];
  const currentIndex = filterTypes.indexOf(currentType);

  // 获取当前滤镜后面的2个滤镜
  const nextFilters: LutType[] = [];
  for (let i = 1; i <= 2; i++) {
    const nextIndex = (currentIndex + i) % filterTypes.length;
    nextFilters.push(filterTypes[nextIndex]);
  }

  return nextFilters;
};

export const FilterPanel = ({ onClose }: FilterPanelProps) => {
  const {
    selectedLayerId,
    layers,
    updateLayer,
    setDisplayIntensity,
    displayIntensity,
  } = useLayerStore();

  const selectedLayer = layers.find(
    (layer): layer is ImageLayer =>
      layer.id === selectedLayerId && layer.type === "image"
  );

  const handleFilterChange = useCallback(
    async (type: LutType) => {
      if (!selectedLayerId) return;

      // 预加载下一个可能用到的 LUT
      const nextFilters = getNextPossibleFilters(type);
      Promise.all(nextFilters.map((t: LutType) => filterEngine.loadLut(t)));

      try {
        await filterEngine.loadLut(type);
        updateLayer(selectedLayerId, {
          filterType: type,
          filterIntensity: 1,
        });
      } catch (error) {
        console.error("Filter change failed:", error);
      }
    },
    [selectedLayerId]
  );

  const handleIntensityChange = useCallback(
    (intensity: number) => {
      if (!selectedLayerId || !selectedLayer) return;
      // 只更新显示值，不触发滤镜重新渲染
      setDisplayIntensity(intensity);
    },
    [selectedLayerId, selectedLayer, setDisplayIntensity]
  );

  // 滑动结束后应用滤镜
  const handleIntensityComplete = useCallback(
    async (intensity: number) => {
      if (!selectedLayerId || !selectedLayer) return;

      try {
        // 清除之前的缓存
        filterEngine.clearFilterCache(selectedLayer.filterType);
        // 一次性更新
        updateLayer(selectedLayerId, {
          filterIntensity: intensity,
          isUpdatingFilter: true, // 避免触发不必要的重渲染
        });

        // 等待滤镜应用完成
        await new Promise((resolve) => setTimeout(resolve, 100));

        updateLayer(selectedLayerId, {
          isUpdatingFilter: false,
        });
      } catch (error) {
        console.error("Error applying intensity:", error);
      }
    },
    [selectedLayerId, selectedLayer, updateLayer]
  );

  if (!selectedLayer) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {Object.entries(FILTER_PRESETS).map(([type, preset]) => (
          <FilterPreview
            key={type}
            type={type as LutType}
            isSelected={selectedLayer?.filterType === type}
            onSelect={() => handleFilterChange(type as LutType)}
          />
        ))}
      </ScrollView>

      {selectedLayer?.filterType !== "normal" && (
        <IntensitySlider
          value={selectedLayer.filterIntensity || 1}
          displayValue={displayIntensity}
          onChange={handleIntensityChange}
          onComplete={handleIntensityComplete}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
});
