import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLayerStore } from "../../../store/useLayerStore";
import { FILTER_PRESETS, LutType } from "../../../types/filter";
import { ImageLayer } from "../../../types/layer";
import { filterEngine } from "../filters/FilterEngine";

interface FilterPanelProps {
  onClose: () => void;
}

export const FilterPanel = ({ onClose }: FilterPanelProps) => {
  const { selectedLayerId, layers, updateLayer } = useLayerStore();
  const [isLoading, setIsLoading] = useState(false);  // 添加 loading 状态

  // 获取当前选中的图层
  const selectedLayer = layers.find(
    (layer): layer is ImageLayer =>
      layer.id === selectedLayerId && layer.type === "image"
  );

  const handleFilterSelect = async (filterType: LutType) => {
    try {
      console.log("Filter selected:", filterType);
      if (!selectedLayerId) {
        console.log("No layer selected");
        return;
      }

      setIsLoading(true);

      // 预加载 LUT
      console.log("Loading LUT for type:", filterType);
      const lutImage = await filterEngine.loadLut(filterType);
      console.log("LUT load result:", {
        success: !!lutImage,
        filterType,
        imageInfo: lutImage ? {
          width: lutImage.width(),
          height: lutImage.height()
        } : null
      });

      if (!lutImage && filterType !== 'normal') {
        throw new Error(`Failed to load LUT: ${filterType}`);
      }

      console.log("Updating layer:", selectedLayerId, filterType);
      updateLayer(selectedLayerId, {
        filterType,
        filterIntensity: 1,
      } as Partial<ImageLayer>);
    } catch (error) {
      console.error("Error applying filter:", error);
      Alert.alert("错误", "加载滤镜失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  console.log("Current layer:", selectedLayer);
  console.log("Selected filter:", selectedLayer?.filterType);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>滤镜</Text>
        <TouchableOpacity onPress={onClose}>
          <Text>关闭</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal style={styles.filterList}>
        {Object.entries(FILTER_PRESETS).map(([type, config]) => {
          const isSelected = selectedLayer?.filterType === type;
          console.log("Filter item:", type, isSelected);

          return (
            <TouchableOpacity
              key={type}
              style={[styles.filterItem, isSelected && styles.selectedItem]}
              onPress={() => handleFilterSelect(type as LutType)}
              disabled={isLoading}  // 加载时禁用按钮
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text
                  style={[styles.filterName, isSelected && styles.selectedName]}
                >
                  {config.name}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  filterList: {
    padding: 16,
  },
  filterItem: {
    marginRight: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    minWidth: 80,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedItem: {
    backgroundColor: "#007AFF",
    borderColor: "#0056b3",
  },
  filterName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  selectedName: {
    color: "#fff",
  },
});
