import React, { FC } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import { PanelHeader } from "../components/PanelHeader";
import { useCanvasStore } from "../../../store/useCanvasStore";
import { FILTER_NAMES } from "../filters/shaders/FilterShader";

interface FilterPanelProps {
  onClose: () => void;
}

export const FilterPanel: FC<FilterPanelProps> = ({ onClose }) => {
  const { selectedLayerId, updateLayer } = useCanvasStore();

  const handleFilterSelect = (filterType: string) => {
    if (!selectedLayerId) return;
    updateLayer(selectedLayerId, {
      filterType,
      filterIntensity: 1,
    });
  };

  return (
    <View style={styles.container}>
      <PanelHeader title="滤镜" onClose={onClose} />
      <ScrollView horizontal style={styles.filterList}>
        {Object.keys(FILTER_NAMES).map((filterName) => (
          <TouchableOpacity
            key={filterName}
            style={styles.filterItem}
            onPress={() => handleFilterSelect(filterName)}
          >
            <Text style={styles.filterText}>{filterName}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  filterList: {
    padding: 16,
  },
  filterItem: {
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  filterText: {
    fontSize: 14,
    color: "#333",
  },
});
