import React, { useCallback } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useLayerStore } from "../../../store/useLayerStore";
import { FILTER_PRESETS, LutType } from "../../../types/filter";
import { FilterPreview } from "../filters/components/FilterPreview";
import { IntensitySlider } from "../filters/components/IntensitySlider";
import { ImageLayer } from "../../../types/layer";
import { filterEngine } from "../filters/FilterEngine";

interface FilterPanelProps {
  onClose: () => void;
}

const FILTER_ITEMS = [
  { type: "normal", name: "原图" },
  { type: "lut1", name: "日系" },
  { type: "lut2", name: "胶片" },
  { type: "lut3", name: "黑白" },
  { type: "lut4", name: "复古" },
  { type: "lut5", name: "清新" },
] as const;

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
      console.log("Starting filter change:", { type });

      if (!selectedLayerId || !selectedLayer) {
        console.log("No selected layer");
        return;
      }

      try {
        // 预加载 LUT
        const lutImage = await filterEngine.loadLut(type);
        console.log("LUT loaded:", { type, success: !!lutImage });

        // 即使 lutImage 为 null (normal 类型) 也要更新
        updateLayer(selectedLayerId, {
          filterType: type,
          filterIntensity: 1, // 重置强度为默认值
        });
      } catch (error) {
        console.error("Error changing filter:", error);
      }
    },
    [selectedLayerId, selectedLayer, updateLayer]
  );

  // 使用 debounce 处理强度变化，只在滑动结束时更新
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

        // 一次性更新，避免多次渲染
        updateLayer(selectedLayerId, {
          filterIntensity: intensity,
          isUpdatingFilter: true, // 添加标记，避免触发不必要的重渲染
        });

        // 等待滤镜应用完成
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 更新完成
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
        {FILTER_ITEMS.map((item) => (
          <FilterPreview
            key={item.type}
            name={item.name}
            type={item.type}
            isSelected={selectedLayer?.filterType === item.type}
            onSelect={() => handleFilterChange(item.type)}
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
