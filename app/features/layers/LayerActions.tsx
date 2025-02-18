import React, { FC } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLayerStore } from "../../store/useLayerStore";

interface LayerActionsProps {
  layerId: string;
}

export const LayerActions: FC<LayerActionsProps> = ({ layerId }) => {
  const { duplicateLayer, removeLayer } = useLayerStore();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => duplicateLayer(layerId)}
        hitSlop={8}
      >
        <MaterialIcons name="content-copy" size={20} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => removeLayer(layerId)}
        hitSlop={8}
      >
        <MaterialIcons name="delete" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});
