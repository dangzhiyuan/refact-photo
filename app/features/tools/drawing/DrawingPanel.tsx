import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useDrawingStore } from "../../../store/drawingStore";
import { MaterialIcons } from "@expo/vector-icons";

// 颜色选项
const COLORS = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FF8800",
  "#8800FF",
];

// 画笔粗细
const BRUSH_SIZES = [2, 4, 6, 8, 12];

export const DrawingPanel: React.FC = () => {
  const { strokeStyle, setStrokeStyle, undo, redo, clear } = useDrawingStore();

  return (
    <View style={styles.container}>
      {/* 颜色选择器 */}
      <View style={styles.colorSelector}>
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              strokeStyle.color === color && styles.selectedColor,
            ]}
            onPress={() => setStrokeStyle({ color })}
          />
        ))}
      </View>

      {/* 画笔粗细选择器 */}
      <View style={styles.brushSelector}>
        {BRUSH_SIZES.map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.brushOption,
              strokeStyle.width === size && styles.selectedBrush,
            ]}
            onPress={() => setStrokeStyle({ width: size })}
          >
            <View
              style={[
                styles.brushSample,
                { width: size * 2, height: size * 2, borderRadius: size },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* 控制按钮 */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={undo}>
          <MaterialIcons name="undo" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={redo}>
          <MaterialIcons name="redo" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={clear}>
          <MaterialIcons name="delete" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  colorSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  brushSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  brushOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333333",
  },
  selectedBrush: {
    backgroundColor: "#555555",
  },
  brushSample: {
    backgroundColor: "#FFFFFF",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333333",
  },
});
