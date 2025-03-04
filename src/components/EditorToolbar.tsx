import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useEditorStore } from "../store/editorStore";

export const EditorToolbar = () => {
  const { editorMode, setEditorMode } = useEditorStore();
  
  const tools = [
    { id: "filter", label: "滤镜" },
    { id: "sticker", label: "贴纸" },
    { id: "text", label: "文字" },
    { id: "drawing", label: "涂鸦" },
    { id: "adjust", label: "调整" },
  ];
  
  return (
    <View style={styles.container}>
      {tools.map((tool) => (
        <TouchableOpacity
          key={tool.id}
          style={[
            styles.toolButton,
            editorMode === tool.id && styles.activeToolButton
          ]}
          onPress={() => setEditorMode(tool.id as any)}
        >
          <Text
            style={[
              styles.toolText,
              editorMode === tool.id && styles.activeToolText
            ]}
          >
            {tool.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 50,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  toolButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activeToolButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  toolText: {
    fontSize: 14,
  },
  activeToolText: {
    fontWeight: "bold",
  },
}); 