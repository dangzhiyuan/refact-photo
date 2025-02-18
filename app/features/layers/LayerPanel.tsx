import React, { FC, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useLayerStore } from "../../store/useLayerStore";
import { LayerListItem } from "./LayerListItem";

export const LayerPanel: FC = () => {
  const { layers, selectedLayerId, setSelectedLayer } = useLayerStore();

  const sortedLayers = useMemo(() => {
    return layers
      .sort((a, b) => b.zIndex - a.zIndex)
      .map((layer, index) => ({ ...layer, index }));
  }, [layers]);

  return (
    <View style={styles.container}>
      {sortedLayers.map((layer) => (
        <LayerListItem
          key={layer.id}
          layer={layer}
          isSelected={layer.id === selectedLayerId}
          totalLayers={sortedLayers.length}
          onSelect={() => setSelectedLayer(layer.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
