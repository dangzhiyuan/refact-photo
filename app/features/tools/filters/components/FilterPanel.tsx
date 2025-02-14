// 创建滤镜面板：
// - 预览缩略图
// - 滤镜强度调节
// - 常见日系滤镜（暖色调、褪色效果等）

import { View, ScrollView, StyleSheet, Text } from "react-native";
import { FilterPreview } from "./FilterPreview";
import { useState, useCallback } from "react";
import Slider from "@react-native-community/slider";
import { FILTER_NAMES, FilterName } from "../shaders/FilterShader";

interface FilterPanelProps {
  imageUri: string;
  onFilterChange: (type: FilterName, intensity: number) => void;
}

export const FilterPanel = ({ imageUri, onFilterChange }: FilterPanelProps) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterName>("normal");
  const [intensity, setIntensity] = useState(0);
  const [displayIntensity, setDisplayIntensity] = useState(0); // 用于显示的临时值

  const handleFilterSelect = (filterName: FilterName) => {
    setSelectedFilter(filterName);
    onFilterChange(filterName, intensity);
  };

  // 滑动时只更新显示值
  const handleValueChange = useCallback((value: number) => {
    setDisplayIntensity(Math.round(value * 100));
  }, []);

  // 滑动结束时才更新滤镜和实际强度值
  const handleSlidingComplete = useCallback(
    (value: number) => {
      setIntensity(value);
      onFilterChange(selectedFilter, value);
    },
    [selectedFilter, onFilterChange]
  );

  return (
    <View style={styles.container}>
      <ScrollView horizontal style={styles.filterList}>
        {Object.keys(FILTER_NAMES).map((key) => (
          <FilterPreview
            key={key}
            imageUri={imageUri}
            filterKey={key as FilterName}
            intensity={intensity}
            onSelect={handleFilterSelect}
            isSelected={key === selectedFilter}
          />
        ))}
      </ScrollView>

      {selectedFilter !== "normal" && (
        <View style={styles.sliderContainer}>
          <Text style={styles.intensityLabel}>强度: {displayIntensity}%</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={intensity}
            onValueChange={handleValueChange}
            onSlidingComplete={handleSlidingComplete}
            step={0.01}
            thumbTintColor="#000"
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#ddd"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  filterList: {
    flexDirection: "row",
    marginBottom: 16,
  },
  sliderContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  intensityLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  slider: {
    width: "90%",
    height: 40,
  },
});
