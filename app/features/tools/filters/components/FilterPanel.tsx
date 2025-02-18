// 创建滤镜面板：
// - 预览缩略图
// - 滤镜强度调节
// - 常见日系滤镜（暖色调、褪色效果等）

import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { FilterPreview } from "./FilterPreview";
import { IntensitySlider } from "./IntensitySlider";
import { LutType, FILTER_PRESETS } from "../../../../types/filter";

interface FilterPanelProps {
  selectedFilter: LutType;
  intensity: number;
  onFilterChange: (type: LutType, intensity: number) => void;
}

export const FilterPanel = ({
  selectedFilter,
  intensity,
  onFilterChange,
}: FilterPanelProps) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {Object.entries(FILTER_PRESETS).map(([type, config]) => (
          <FilterPreview
            key={type}
            name={config.name}
            type={type as LutType}
            isSelected={type === selectedFilter}
            onSelect={() => onFilterChange(type as LutType, intensity)}
          />
        ))}
      </ScrollView>
      {selectedFilter !== "normal" && (
        <IntensitySlider
          value={intensity}
          onChange={(value) => onFilterChange(selectedFilter, value)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
});
