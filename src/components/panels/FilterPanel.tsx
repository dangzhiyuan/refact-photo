import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import Slider from "@react-native-community/slider";
import { useFilterStore } from "../../store/filterStore";
import { useEditorStore } from "../../store/editorStore";

export const FilterPanel = () => {
  const { filters, currentFilter, intensity, setCurrentFilter, setIntensity } = useFilterStore();
  const { photo } = useEditorStore();
  
  if (!photo.uri) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterList}>
        {filters.map((filter) => (
          <TouchableOpacity 
            key={filter.id} 
            style={[
              styles.filterItem,
              currentFilter === filter.id && styles.activeFilterItem
            ]}
            onPress={() => setCurrentFilter(filter.id)}
          >
            <Image
              source={{ uri: photo.uri }}
              style={styles.filterPreview}
              // 这里应该应用滤镜预览，暂时使用原图
            />
            <Text style={[
              styles.filterName,
              currentFilter === filter.id && styles.activeFilterName
            ]}>
              {filter.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.intensityContainer}>
        <Text style={styles.intensityLabel}>滤镜强度: {Math.round(intensity * 100)}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={intensity}
          onValueChange={setIntensity}
          minimumTrackTintColor="#000000"
          maximumTrackTintColor="#CCCCCC"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 10,
  },
  filterList: {
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  filterItem: {
    marginRight: 15,
    alignItems: "center",
  },
  activeFilterItem: {
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 5,
    padding: 2,
  },
  filterPreview: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginBottom: 5,
  },
  filterName: {
    fontSize: 12,
  },
  activeFilterName: {
    fontWeight: "bold",
  },
  intensityContainer: {
    padding: 15,
  },
  intensityLabel: {
    marginBottom: 10,
  },
  slider: {
    width: "100%",
    height: 40,
  },
}); 