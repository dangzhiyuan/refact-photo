import React from "react";
import { TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import { LutType } from "../../../../types/filter";
import { filterEngine } from "../FilterEngine";
import { useImage } from "@shopify/react-native-skia";

interface FilterPreviewProps {
  name: string;
  type: LutType;
  isSelected: boolean;
  onSelect: () => void;
}

export const FilterPreview = ({
  name,
  type,
  isSelected,
  onSelect,
}: FilterPreviewProps) => {
  // 加载预览图片
  const previewImage = useImage(require("../../../../assets/preview.jpg"));

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selected]}
      onPress={onSelect}
    >
      {previewImage && (
        <Image
          source={require("../../../../assets/preview.jpg")}
          style={styles.preview}
        />
      )}
      <Text style={styles.name}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    alignItems: "center",
    opacity: 0.8,
  },
  selected: {
    opacity: 1,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 8,
  },
  preview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
});
