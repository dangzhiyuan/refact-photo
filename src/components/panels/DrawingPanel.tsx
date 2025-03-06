import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Icon } from "../common/Icon";
import { ComponentProps } from "react";
import { COLORS } from "../../theme/colors";
import Slider from "@react-native-community/slider";

interface DrawingPanelProps {
  onClose?: () => void;
}

export const DrawingPanel: React.FC<DrawingPanelProps> = ({ onClose }) => {
  const [selectedTool, setSelectedTool] = useState("brush");
  const [selectedColor, setSelectedColor] = useState("#FF6B95");
  const [brushSize, setBrushSize] = useState(5);

  const drawingTools = [
    { id: "brush", name: "画笔", icon: "brush-outline" },
    { id: "pen", name: "马克笔", icon: "pencil-outline" },
    { id: "eraser", name: "橡皮擦", icon: "trash-outline" },
  ];

  const colorOptions = [
    "#FF6B95",
    "#3478F6",
    "#4CD964",
    "#FFCC00",
    "#FF3B30",
    "#5856D6",
    "#000000",
    "#FFFFFF",
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>绘画工具</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close-outline" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.optionGroup}>
          <Text style={styles.optionTitle}>工具</Text>
          <View style={styles.toolsRow}>
            {drawingTools.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={[
                  styles.toolButton,
                  selectedTool === tool.id && styles.selectedToolButton,
                ]}
                onPress={() => setSelectedTool(tool.id)}
              >
                <Icon
                  name={tool.icon}
                  size={22}
                  color={
                    selectedTool === tool.id
                      ? COLORS.accent
                      : COLORS.text.secondary
                  }
                />
                <Text
                  style={[
                    styles.toolName,
                    selectedTool === tool.id && styles.selectedToolName,
                  ]}
                >
                  {tool.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.optionGroup}>
          <Text style={styles.optionTitle}>颜色</Text>
          <View style={styles.colorsGrid}>
            {colorOptions.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColorOption,
                  color === "#FFFFFF" && styles.whiteColorOption,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>

        <View style={styles.optionGroup}>
          <View style={styles.sizeHeader}>
            <Text style={styles.optionTitle}>笔刷大小</Text>
            <Text style={styles.sizeValue}>{brushSize}</Text>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={30}
            value={brushSize}
            onValueChange={(value) => setBrushSize(Math.round(value))}
            minimumTrackTintColor={COLORS.accent}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={COLORS.accent}
          />

          <View style={styles.brushPreview}>
            <View
              style={[
                styles.brushSizePreview,
                {
                  width: brushSize,
                  height: brushSize,
                  backgroundColor: selectedColor,
                },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.clearButton,
            { opacity: selectedTool === "eraser" ? 0.5 : 1 },
          ]}
          disabled={selectedTool === "eraser"}
        >
          <Text style={styles.clearButtonText}>清除所有</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.panelBackground,
    borderRadius: 12,
    margin: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  optionGroup: {
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text.primary,
    marginBottom: 10,
  },
  toolsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toolButton: {
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.canvasBackground,
    minWidth: 80,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedToolButton: {
    backgroundColor: COLORS.accent + "15",
    borderColor: COLORS.accent,
  },
  toolName: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  selectedToolName: {
    color: COLORS.accent,
    fontWeight: "500",
  },
  colorsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 12,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: COLORS.accent,
  },
  whiteColorOption: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sizeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sizeValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  brushPreview: {
    alignItems: "center",
    marginTop: 10,
  },
  brushSizePreview: {
    borderRadius: 50,
    minWidth: 4,
    minHeight: 4,
  },
  clearButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  clearButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
