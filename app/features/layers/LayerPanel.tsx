import React, { FC } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { PanelHeader } from "../tools/panels/components/PanelHeader";
import { useLayerStore } from "../../store/useLayerStore";
import { LayerListItem } from "./LayerListItem";

interface LayerPanelProps {
  onClose: () => void;
}

export const LayerPanel: FC<LayerPanelProps> = ({ onClose }) => {
  const { layers, selectedLayerId, selectLayer } = useLayerStore();

  // 将图层按 zIndex 排序并添加索引
  const sortedLayers = Array.from(layers.values())
    .sort((a, b) => b.zIndex - a.zIndex)
    .map((layer, index) => ({ ...layer, index }));

  return (
    <View style={styles.container}>
      <PanelHeader title="图层" onClose={onClose} />
      <ScrollView style={styles.content}>
        {sortedLayers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无图层</Text>
          </View>
        ) : (
          sortedLayers.map((layer) => (
            <LayerListItem
              key={layer.id}
              layer={layer}
              isSelected={layer.id === selectedLayerId}
              totalLayers={sortedLayers.length}
              onSelect={() => selectLayer(layer.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    color: "#999",
    fontSize: 14,
  },
});
