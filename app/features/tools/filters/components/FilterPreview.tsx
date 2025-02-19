import React from "react";
import { TouchableOpacity, Text, Image, StyleSheet, View } from "react-native";
import { LutType } from "../../../../types/filter";
import { LutImages } from "../../../../assets/luts";

interface FilterPreviewProps {
  name: string;
  type: LutType;
  isSelected: boolean;
  onSelect: () => void;
}

export const FilterPreview: React.FC<FilterPreviewProps> = ({
  name,
  type,
  isSelected,
  onSelect,
}) => {
  // 对于 normal 类型，不显示 LUT 预览图
  const lutPreviewSource = type === "normal" ? null : LutImages[type];

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selected]}
      onPress={onSelect}
    >
      {lutPreviewSource ? (
        <Image source={lutPreviewSource} style={styles.preview} />
      ) : (
        <View style={styles.placeholder} />
      )}
      <Text style={styles.name}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginHorizontal: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selected: {
    borderColor: "#007AFF",
  },
  preview: {
    width: 64,
    height: 32,
    borderRadius: 4,
    marginBottom: 4,
  },
  placeholder: {
    width: 64,
    height: 32,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
    marginBottom: 4,
  },
  name: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
});
