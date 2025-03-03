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
import { Layer } from "../../../../types/layer";
import { useLayerStore } from "../../../../store/useLayerStore";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

interface LayerListItemProps {
  layer: Layer;
  isSelected: boolean;
  onSelect: () => void;
}

export const LayerListItem: FC<LayerListItemProps> = ({
  layer,
  isSelected,
  onSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const { updateLayer, removeLayer, duplicateLayer } = useLayerStore();

  const toggleVisibility = useCallback(() => {
    updateLayer(layer.id, { visible: !layer.visible });
  }, [layer.id, layer.visible, updateLayer]);

  const handleEditPress = useCallback(() => {
    setIsEditing(true);
    setEditName(layer.name);
  }, [layer.name]);

  const handleNameSubmit = useCallback(() => {
    if (editName.trim()) {
      updateLayer(layer.id, { name: editName.trim() });
    }
    setIsEditing(false);
  }, [editName, layer.id, updateLayer]);

  return (
    <View style={[styles.container, isSelected && styles.selected]}>
      <Pressable
        onPress={toggleVisibility}
        style={styles.visibilityButton}
        hitSlop={8}
      >
        <MaterialIcons
          name={layer.visible ? "visibility" : "visibility-off"}
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
        </View>
      </TouchableOpacity>

      {isSelected && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEditPress}
            hitSlop={8}
          >
            <MaterialIcons name="edit" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => duplicateLayer(layer.id)}
            hitSlop={8}
          >
            <MaterialIcons name="content-copy" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => removeLayer(layer.id)}
            hitSlop={8}
          >
            <MaterialIcons name="delete" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      )}
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
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
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
});
