import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useCanvasStore } from "../../../../store/useCanvasStore";
import { MaterialIcons } from "@expo/vector-icons";
import { Layer } from "../../../../types/layer";

interface LayerPanelProps {
  onClose: () => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({ onClose }) => {
  const { layers, selectedLayerId, setSelectedLayerId, deleteLayer } =
    useCanvasStore();

  const handleSelectLayer = (layerId: string) => {
    setSelectedLayerId(layerId);
  };

  const handleDeleteLayer = (layerId: string) => {
    deleteLayer(layerId);
  };

  const getLayerName = (layer: Layer) => {
    switch (layer.type) {
      case "image":
        return `图片 ${layer.id.substring(0, 5)}`;
      case "text":
        return `文本 "${(layer as any).text?.substring(0, 10) || "文本"}"`;
      default:
        return `图层 ${layer.id.substring(0, 5)}`;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>图层管理</Text>
      </View>

      <ScrollView style={styles.layerList}>
        {layers.length === 0 ? (
          <Text style={styles.emptyText}>当前没有图层</Text>
        ) : (
          layers.map((layer, index) => (
            <TouchableOpacity
              key={layer.id}
              style={[
                styles.layerItem,
                layer.id === selectedLayerId && styles.selectedLayer,
              ]}
              onPress={() => handleSelectLayer(layer.id)}
            >
              <View style={styles.layerInfo}>
                <Text style={styles.layerNumber}>{layers.length - index}</Text>
                <Text style={styles.layerName}>{getLayerName(layer)}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteLayer(layer.id)}
              >
                <MaterialIcons name="delete" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    height: 300,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  layerList: {
    flex: 1,
  },
  layerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  selectedLayer: {
    backgroundColor: "#f0f0f0",
  },
  layerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  layerNumber: {
    width: 30,
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  layerName: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    padding: 16,
    textAlign: "center",
    color: "#999",
  },
});
