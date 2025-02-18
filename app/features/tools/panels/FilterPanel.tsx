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
import { FILTER_PRESETS, LutType } from "../../../types/filter";
import { ImageLayer } from "../../../types/layer";

interface FilterPanelProps {
  onClose: () => void;
}

export const FilterPanel: FC<FilterPanelProps> = ({ onClose }) => {
  const { selectedLayerId, updateLayer } = useCanvasStore();

  const handleFilterSelect = (filterType: LutType) => {
    if (!selectedLayerId) return;

    updateLayer(selectedLayerId, {
      type: "image",
      filterType,
      filterIntensity: 1,
    } as Partial<ImageLayer>);
  };

  return (
    <View style={styles.container}>
      <PanelHeader title="滤镜" onClose={onClose} />
      <ScrollView horizontal style={styles.filterList}>
        {Object.entries(FILTER_PRESETS).map(([type, config]) => (
          <TouchableOpacity
            key={type}
            style={styles.filterItem}
            onPress={() => handleFilterSelect(type as LutType)}
          >
            <Text style={styles.filterText}>{config.name}</Text>
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
