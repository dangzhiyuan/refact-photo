import React, { FC } from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { FilterName } from "../shaders/FilterShader";

interface FilterPreviewProps {
  imageUri: string;
  filterKey: string;
  intensity: number;
  onSelect: (filterName: FilterName) => void;
  isSelected?: boolean;
}

export const FilterPreview: FC<FilterPreviewProps> = ({
  imageUri,
  filterKey,
  intensity,
  onSelect,
  isSelected,
}) => {
  // 这里可以使用预渲染的缩略图或者实时生成的预览图
  const previewUri = imageUri; // 实际项目中应该使用预渲染的缩略图

  return (
    <Pressable onPress={() => onSelect(filterKey as FilterName)}>
      <View style={[styles.container, isSelected && styles.selectedContainer]}>
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: previewUri }}
            style={styles.preview}
            resizeMode="cover"
          />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
    borderRadius: 8,
    padding: 2,
  },
  selectedContainer: {
    backgroundColor: "#007AFF",
  },
  previewContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
  },
  preview: {
    width: "100%",
    height: "100%",
  },
});
