import React from "react";
import { TouchableOpacity, Text, Image, StyleSheet, View } from "react-native";
import { LutType, LutPreviews } from "../../../../assets/luts";
import { FILTER_PRESETS } from "../../../../types/filter";

interface FilterPreviewProps {
  type: LutType;
  isSelected: boolean;
  onSelect: (type: LutType) => void;
}

export const FilterPreview: React.FC<FilterPreviewProps> = ({
  type,
  isSelected,
  onSelect,
}) => {
  // 获取滤镜名称
  const filterName = FILTER_PRESETS[type].name;

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selected]}
      onPress={() => onSelect(type)}
    >
      <View style={styles.imageContainer}>
        {type !== "normal" ? (
          <Image source={LutPreviews[type]} style={styles.preview} />
        ) : (
          <View style={[styles.preview, { backgroundColor: "grey" }]}></View>
        )}
      </View>
      <Text style={styles.label}>{filterName}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginHorizontal: 8,
    opacity: 0.8,
  },
  selected: {
    opacity: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 4,
    backgroundColor: "#F5F5F5",
  },
  preview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  label: {
    fontSize: 12,
    color: "#333",
    marginTop: 4,
  },
});
