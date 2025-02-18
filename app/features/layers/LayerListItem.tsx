import React, { FC, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Layer } from "../../types/layer";
import { useLayerStore } from "../../store/useLayerStore";
import { LayerActions } from "./LayerActions";

interface LayerListItemProps {
  layer: Layer & { index: number };
  isSelected: boolean;
  totalLayers: number;
  onSelect: () => void;
}

export const LayerListItem: FC<LayerListItemProps> = ({
  layer,
  isSelected,
  totalLayers,
  onSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const { updateLayer, reorderLayers } = useLayerStore();

  const toggleVisibility = useCallback(() => {
    updateLayer(layer.id, { isVisible: !layer.isVisible });
  }, [layer.id, layer.isVisible, updateLayer]);

  const handleEditPress = useCallback(() => {
    setIsEditing(true);
    setEditName(layer.name);
  }, [layer.name]);

  const handleNameSubmit = useCallback(() => {
    if (editName.trim()) {
      const orderMatch = layer.name.match(/^#(\d+)/);
      const newName = orderMatch
        ? `${orderMatch[0]} ${editName.trim()}`
        : editName.trim();
      updateLayer(layer.id, { name: newName });
    }
    setIsEditing(false);
  }, [editName, layer.id, layer.name, updateLayer]);

  const moveUp = useCallback(() => {
    if (layer.index > 0) {
      reorderLayers(layer.index, layer.index - 1);
    }
  }, [layer.index, reorderLayers]);

  const moveDown = useCallback(() => {
    if (layer.index < totalLayers - 1) {
      reorderLayers(layer.index, layer.index + 1);
    }
  }, [layer.index, totalLayers, reorderLayers]);

  return (
    <View style={[styles.container, isSelected && styles.selected]}>
      <Pressable
        onPress={toggleVisibility}
        style={styles.visibilityButton}
        hitSlop={8}
      >
        <MaterialIcons
          name={layer.isVisible ? "visibility" : "visibility-off"}
          size={24}
          color="#333"
        />
      </Pressable>
      <TouchableOpacity
        style={styles.content}
        onPress={onSelect}
        activeOpacity={0.7}
      >
        <View style={styles.textContainer}>
          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={editName}
              onChangeText={setEditName}
              onBlur={handleNameSubmit}
              onSubmitEditing={handleNameSubmit}
              autoFocus
              selectTextOnFocus
            />
          ) : (
            <Text style={styles.name}>{layer.name}</Text>
          )}
          <Text style={styles.zIndex}>z-index: {layer.zIndex}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        {isSelected && (
          <>
            <TouchableOpacity
              style={[
                styles.actionButton,
                layer.index === 0 && styles.disabled,
              ]}
              onPress={moveUp}
              disabled={layer.index === 0}
            >
              <MaterialIcons
                name="arrow-upward"
                size={20}
                color={layer.index === 0 ? "#ccc" : "#333"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                layer.index === totalLayers - 1 && styles.disabled,
              ]}
              onPress={moveDown}
              disabled={layer.index === totalLayers - 1}
            >
              <MaterialIcons
                name="arrow-downward"
                size={20}
                color={layer.index === totalLayers - 1 ? "#ccc" : "#333"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEditPress}
              hitSlop={8}
            >
              <MaterialIcons name="edit" size={20} color="#333" />
            </TouchableOpacity>
            <LayerActions layerId={layer.id} />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    width: "100%",
  },
  selected: {
    backgroundColor: "#f0f0f0",
  },
  visibilityButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 8,
  },
  name: {
    fontSize: 16,
    color: "#333",
  },
  zIndex: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginRight: 4,
  },
  nameInput: {
    fontSize: 16,
    color: "#333",
    padding: 4,
    paddingHorizontal: 8,
    margin: 0,
    height: 28,
    minWidth: 100,
    backgroundColor: "#fff",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  disabled: {
    opacity: 0.5,
  },
});
