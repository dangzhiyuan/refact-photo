import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../theme/colors";

interface TextPanelProps {
  onClose?: () => void;
}

export const TextPanel: React.FC<TextPanelProps> = ({ onClose }) => {
  const [inputText, setInputText] = useState("");
  const [selectedFont, setSelectedFont] = useState("default");
  const [fontSize, setFontSize] = useState(20);
  const [textAlign, setTextAlign] = useState("center");

  const fonts = [
    { id: "default", name: "默认" },
    { id: "roboto", name: "Roboto" },
    { id: "opensans", name: "Open Sans" },
    { id: "montserrat", name: "Montserrat" },
  ];

  const alignOptions = [
    { id: "left", icon: "text" },
    { id: "center", icon: "text" },
    { id: "right", icon: "text" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>添加文字</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons
              name="close-outline"
              size={24}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.textInput}
          placeholder="输入文字..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          placeholderTextColor={COLORS.text.secondary}
        />

        <View style={styles.optionGroup}>
          <Text style={styles.optionTitle}>字体选择</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.optionsRow}
          >
            {fonts.map((font) => (
              <TouchableOpacity
                key={font.id}
                style={[
                  styles.fontOption,
                  selectedFont === font.id && styles.selectedFontOption,
                ]}
                onPress={() => setSelectedFont(font.id)}
              >
                <Text
                  style={[
                    styles.fontName,
                    selectedFont === font.id && styles.selectedFontName,
                  ]}
                >
                  {font.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.optionGroup}>
          <Text style={styles.optionTitle}>字体大小</Text>
          <View style={styles.sizeControls}>
            <TouchableOpacity
              style={styles.sizeButton}
              onPress={() => setFontSize((prev) => Math.max(10, prev - 2))}
            >
              <Ionicons name="remove" size={18} color={COLORS.text.primary} />
            </TouchableOpacity>

            <Text style={styles.sizeValue}>{fontSize}</Text>

            <TouchableOpacity
              style={styles.sizeButton}
              onPress={() => setFontSize((prev) => Math.min(60, prev + 2))}
            >
              <Ionicons name="add" size={18} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.optionGroup}>
          <Text style={styles.optionTitle}>对齐方式</Text>
          <View style={styles.alignOptions}>
            {alignOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.alignButton,
                  textAlign === option.id && styles.selectedAlignButton,
                ]}
                onPress={() => setTextAlign(option.id)}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={
                    textAlign === option.id
                      ? COLORS.accent
                      : COLORS.text.secondary
                  }
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>添加文字</Text>
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
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: COLORS.text.primary,
    backgroundColor: COLORS.canvasBackground,
    minHeight: 100,
    textAlignVertical: "top",
  },
  optionGroup: {
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  fontOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: COLORS.canvasBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedFontOption: {
    backgroundColor: COLORS.accent + "15",
    borderColor: COLORS.accent,
  },
  fontName: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  selectedFontName: {
    color: COLORS.accent,
    fontWeight: "500",
  },
  sizeControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  sizeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.canvasBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sizeValue: {
    marginHorizontal: 12,
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: "500",
    width: 30,
    textAlign: "center",
  },
  alignOptions: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  alignButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: COLORS.canvasBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedAlignButton: {
    backgroundColor: COLORS.accent + "15",
    borderColor: COLORS.accent,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
