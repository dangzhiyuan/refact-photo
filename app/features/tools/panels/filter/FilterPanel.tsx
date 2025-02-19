import React, { useCallback } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useLayerStore } from "../../../../store/useLayerStore";
import { FilterPreview } from "../../filters/components/FilterPreview";
import { IntensitySlider } from "../../filters/components/IntensitySlider";
import { ImageLayer } from "../../../../types/layer";
import { filterEngine } from "../../filters/FilterEngine";
import { LutType } from "../../../../assets/luts";
import { FILTER_PRESETS } from "../../../../types/filter";
import { useFilterStore } from '../../../../store/useFilterStore';
import Slider from "@react-native-community/slider";

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
  const { intensity, setIntensity } = useFilterStore();

  const selectedLayer = layers.find(
    (layer): layer is ImageLayer =>
      layer.id === selectedLayerId && layer.type === "image"
  );


  //缓存滤镜节省性能（有无必要），存在bug，滑动条结束滑动后会一直抖动
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

  const handleIntensityChange = (value: number) => {
    // 只更新共享状态，不更新图层
    setIntensity(value);
  };

  // 滑动结束后才更新图层和应用滤镜
  const handleIntensityComplete = useCallback(
    async (value: number) => {
      if (!selectedLayerId || !selectedLayer) return;

      try {
        // 清除之前的缓存
        filterEngine.clearFilterCache(selectedLayer.filterType);
        
        // 更新图层
        updateLayer(selectedLayerId, {
          filterIntensity: value,
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
        <Slider
          value={intensity}
          onValueChange={handleIntensityChange}
          onSlidingComplete={handleIntensityComplete}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          style={styles.slider}
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
  slider: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 16,
  },
});
