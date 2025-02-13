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
  const [intensity, setIntensity] = useState(0.5);
  const [displayIntensity, setDisplayIntensity] = useState(50); // 用于显示的整数值

  const handleFilterSelect = (filterName: FilterName) => {
    setSelectedFilter(filterName);
    onFilterChange(filterName, intensity);
  };

  // 分离滑动时的更新和滑动结束时的更新
  const handleSlidingComplete = useCallback(
    (value: number) => {
      const roundedValue = Math.round(value * 100) / 100;
      setIntensity(roundedValue);
      setDisplayIntensity(Math.round(roundedValue * 100));
      onFilterChange(selectedFilter, roundedValue);
    },
    [selectedFilter, onFilterChange]
  );

  const handleValueChange = useCallback((value: number) => {
    setDisplayIntensity(Math.round(value * 100));
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView horizontal style={styles.filterList}>
        {Object.keys(FILTER_NAMES).map((key) => (
          <FilterPreview
            key={key}
            imageUri={imageUri}
            filterKey={key}
            intensity={intensity}
            onSelect={handleFilterSelect}
            isSelected={key === selectedFilter}
          />
        ))}
      </ScrollView>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
  },
  filterList: {
    flexDirection: "row",
    marginBottom: 16,
  },
  sliderContainer: {
    marginTop: 8,
    alignItems: "center", // 居中对齐
  },
  intensityLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  slider: {
    width: "90%", // 与参考代码一致
    height: 40,
  },
});
