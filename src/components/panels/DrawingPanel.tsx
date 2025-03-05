import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export const DrawingPanel: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState("#FF0000");
  const [brushSize, setBrushSize] = useState(5);

  // 笔刷颜色选项
  const colors = [
    "#FF0000", // 红色
    "#FF6B6B", // 浅红色
    "#FF9AA2", // 粉色
    "#FFCCCC", // 浅粉色
    "#FFFFFF", // 白色
    "#FFD700", // 金色
    "#4682B4", // 钢蓝色
    "#9370DB", // 紫色
    "#3CB371", // 绿色
    "#000000", // 黑色
  ];

  // 笔刷类型
  const brushTypes = [
    { id: "pen", icon: "edit" },
    { id: "marker", icon: "brush" },
    { id: "highlighter", icon: "format-color-fill" },
    { id: "eraser", icon: "auto-fix-high" },
    { id: "add", icon: "add" },
  ];

  return (
    <View style={styles.container}>
      {/* 颜色选择器 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.colorsContainer}
      >
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorItem,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColorItem,
              color === "#FFFFFF" && styles.whiteColorBorder,
            ]}
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </ScrollView>

      {/* 笔刷类型选择器 */}
      <View style={styles.brushTypesContainer}>
        {brushTypes.map((brush) => (
          <TouchableOpacity key={brush.id} style={styles.brushTypeItem}>
            <MaterialIcons name={brush.icon} size={24} color="#FFF" />
          </TouchableOpacity>
        ))}
      </View>

      {/* 笔刷大小调节器 */}
      <View style={styles.brushSizeContainer}>
        <TouchableOpacity
          onPress={() => setBrushSize(Math.max(1, brushSize - 1))}
        >
          <MaterialIcons name="remove" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.brushSizePreview}>
          <View
            style={[
              styles.brushSizeDot,
              { width: brushSize * 2, height: brushSize * 2 },
            ]}
          />
        </View>
        <TouchableOpacity
          onPress={() => setBrushSize(Math.min(20, brushSize + 1))}
        >
          <MaterialIcons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
  },
  colorsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row",
  },
  colorItem: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  selectedColorItem: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  whiteColorBorder: {
    borderColor: "#999",
  },
  brushTypesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
    paddingHorizontal: 20,
  },
  brushTypeItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(50, 50, 50, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  brushSizeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  brushSizePreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(50, 50, 50, 0.7)",
    marginHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  brushSizeDot: {
    backgroundColor: "#FF0000",
    borderRadius: 50,
  },
});
