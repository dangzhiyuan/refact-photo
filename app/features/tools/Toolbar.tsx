import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  useWindowDimensions,
} from "react-native";
import { useImageManager } from "../../hooks";
import { MaterialIcons } from "@expo/vector-icons";
import { EditorPanels } from "./panels/EditorPanels";

type ToolType = "filter" | "adjustment" | "text" | "layers" | null;

interface ToolItem {
  type: ToolType;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
}

const tools: ToolItem[] = [
  { type: "filter", icon: "filter", label: "滤镜" },
  { type: "adjustment", icon: "tune", label: "调整" },
  { type: "text", icon: "text-fields", label: "文字" },
  { type: "layers", icon: "layers", label: "图层" },
];


export const Toolbar = () => {
  const { height: windowHeight } = useWindowDimensions();
  const panelHeight = windowHeight * 0.45;
  const { pickImage, isLoading } = useImageManager();
  const [activeTool, setActiveTool] = useState<ToolType>(null);

  const handleToolPress = (toolType: ToolType) => {
    setActiveTool((current) => (current === toolType ? null : toolType));
  };

  return (
    <View style={[styles.editorContainer, { height: panelHeight }]}>
      {activeTool && (
        <EditorPanels
          activeTool={activeTool}
          onClose={() => setActiveTool(null)}
        />
      )}
      <View style={[styles.toolbar, { height: panelHeight * 0.15 }]}>
        {tools.map((tool) => (
          <TouchableOpacity
            key={tool.type}
            style={[
              styles.toolButton,
              activeTool === tool.type && styles.activeToolButton,
            ]}
            onPress={() => handleToolPress(tool.type)}
          >
            <MaterialIcons
              name={tool.icon}
              size={24}
              color={activeTool === tool.type ? "#007AFF" : "#333"}
            />
            <Text
              style={[
                styles.toolText,
                activeTool === tool.type && styles.activeToolText,
              ]}
            >
              {tool.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.toolButton} onPress={pickImage}>
          <MaterialIcons name="add-photo-alternate" size={24} color="#333" />
          <Text style={styles.toolText}>选择图片</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  editorContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
  },
  toolbar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    left: 0,
    right: 0,
  },
  toolButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
  },
  activeToolButton: {
    backgroundColor: "#f0f0f0",
  },
  toolText: {
    fontSize: 12,
    marginTop: 4,
    color: "#333",
  },
  activeToolText: {
    color: "#007AFF",
  },
});
