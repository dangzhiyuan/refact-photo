import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import { useTextStore } from "../../../store/textStore";
import { useEditorStore } from "../../../store/editorStore";

// 颜色选项
const TEXT_COLORS = [
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

// 字体选项
const FONT_FAMILIES = ["default", "serif", "monospace"];

export const TextPanel: React.FC = () => {
  const { addText, updateTextStyle } = useTextStore();
  const { selectedLayerId, addLayer } = useEditorStore();
  const [inputText, setInputText] = useState("");

  const handleAddText = () => {
    addText(inputText || "输入文字");
    setInputText("");
    addLayer("text");
  };

  const handleColorChange = (color: string) => {
    if (selectedLayerId) {
      updateTextStyle(selectedLayerId, { color });
    }
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    if (selectedLayerId) {
      updateTextStyle(selectedLayerId, { fontFamily });
    }
  };

  const handleFontSizeChange = (increase: boolean) => {
    if (selectedLayerId) {
      updateTextStyle(selectedLayerId, {
        fontSize: increase ? 28 : 20, // 简化示例，实际应该增减当前大小
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* 文字输入 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="输入要添加的文字..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddText}>
          <Text style={styles.addButtonText}>添加</Text>
        </TouchableOpacity>
      </View>

      {/* 颜色选择器 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.optionsRow}
      >
        {TEXT_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[styles.colorOption, { backgroundColor: color }]}
            onPress={() => handleColorChange(color)}
          />
        ))}
      </ScrollView>

      {/* 字体选择 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.optionsRow}
      >
        {FONT_FAMILIES.map((font) => (
          <TouchableOpacity
            key={font}
            style={styles.fontOption}
            onPress={() => handleFontFamilyChange(font)}
          >
            <Text style={styles.fontOptionText}>{font}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 字体大小控制 */}
      <View style={styles.sizeControl}>
        <TouchableOpacity
          style={styles.sizeButton}
          onPress={() => handleFontSizeChange(false)}
        >
          <Text style={styles.sizeButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.sizeLabel}>字体大小</Text>
        <TouchableOpacity
          style={styles.sizeButton}
          onPress={() => handleFontSizeChange(true)}
        >
          <Text style={styles.sizeButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#FFF",
    backgroundColor: "#333",
  },
  addButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  optionsRow: {
    marginBottom: 12,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#555",
  },
  fontOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#333",
    borderRadius: 8,
    marginRight: 10,
  },
  fontOptionText: {
    color: "#FFF",
  },
  sizeControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sizeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  sizeButtonText: {
    color: "#FFF",
    fontSize: 24,
  },
  sizeLabel: {
    color: "#FFF",
    marginHorizontal: 12,
  },
});
