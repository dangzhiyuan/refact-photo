import React, { FC } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useLayerStore } from "../../../store/useLayerStore";
import { colors } from "../../../constants/colors";

export const LayerList: FC = () => {
  const { layers, selectedLayerId, setSelectedLayer } = useLayerStore();

  return (
    <View style={styles.container}>
      {[...layers]
        .sort((a, b) => b.zIndex - a.zIndex) // 从上到下显示图层
        .map((layer) => (
          <TouchableOpacity
            key={layer.id}
            style={[
              styles.layerItem,
              layer.id === selectedLayerId && styles.selectedLayer,
            ]}
            onPress={() => setSelectedLayer(layer.id)}
          >
            <Text style={styles.layerName}>
              {layer.name || `图层 ${layer.id}`}
            </Text>
          </TouchableOpacity>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  layerItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.cardBk,
  },
  selectedLayer: {
    backgroundColor: colors.primaryLight,
  },
  layerName: {
    color: colors.text,
    fontSize: 14,
  },
});
