import React, { useCallback } from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { useLayerStore } from "../../../../store/useLayerStore";
import { FilterPreview } from "../../filters/components/FilterPreview";
import { IntensitySlider } from "../../filters/components/IntensitySlider";
import { ImageLayer } from "../../../../types/layer";
import { filterEngine } from "../../filters/FilterEngine";
import { LutType } from "../../../../assets/luts";
import { FILTER_PRESETS } from "../../../../types/filter";
import { useFilterStore } from "../../../../store/useFilterStore";
import { PanelHeader } from "../components/PanelHeader";

interface FilterPanelProps {
  onClose: () => void;
}

export const FilterPanel = ({ onClose }: FilterPanelProps) => {
  const { selectedLayerId, layers, updateLayer } = useLayerStore();
  const { intensity, setIntensity } = useFilterStore();

  // 添加调试日志
  console.log("FilterPanel render:", {
    selectedLayerId,
    selectedLayer: selectedLayerId ? layers.get(selectedLayerId) : null,
    layersCount: layers.size,
  });

  // 从 Map 中获取选中的图层
  const selectedLayer = selectedLayerId
    ? (layers.get(selectedLayerId) as ImageLayer)
    : null;

  const handleFilterChange = useCallback(
    async (type: LutType) => {
      // 添加调试日志
      console.log("handleFilterChange:", {
        type,
        selectedLayerId,
        selectedLayer: selectedLayerId ? layers.get(selectedLayerId) : null,
      });

      if (!selectedLayerId || !selectedLayer) return;

      try {
        // 添加调试日志
        console.log("Loading LUT:", type);
        await filterEngine.loadLut(type);

        console.log("Updating layer with filter:", {
          layerId: selectedLayerId,
          filterType: type,
        });

        updateLayer(selectedLayerId, {
          filterType: type,
          filterIntensity: intensity,
        });
      } catch (error) {
        console.error("Filter change failed:", error);
      }
    },
    [selectedLayerId, selectedLayer, intensity, updateLayer]
  );

  if (!selectedLayer) {
    return (
      <View style={styles.container}>
        <PanelHeader title="滤镜" onClose={onClose} />
        <View style={styles.emptyState}>
          <Text>请先选择一个图层</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PanelHeader title="滤镜" onClose={onClose} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {Object.entries(FILTER_PRESETS).map(([type]) => (
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
          value={intensity}
          displayValue={intensity}
          onChange={setIntensity}
          onComplete={(value) => {
            if (selectedLayerId) {
              updateLayer(selectedLayerId, {
                filterIntensity: value,
              });
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
