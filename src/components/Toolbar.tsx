import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useEditorStore } from "../store/editorStore";
import { EditorMode } from "../core/types/canvas";

interface ToolbarItemProps {
  label: string;
  mode: EditorMode;
  active: boolean;
  onPress: () => void;
}

const ToolbarItem: React.FC<ToolbarItemProps> = ({
  label,
  mode,
  active,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.toolItem, active && styles.activeToolItem]}
      onPress={onPress}
    >
      <Text style={[styles.toolLabel, active && styles.activeToolLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const Toolbar: React.FC = () => {
  const { currentMode, setMode } = useEditorStore((state) => ({
    currentMode: state.currentMode,
    setMode: state.setMode,
  }));

  const tools = [
    { label: "编辑", mode: EditorMode.EDIT },
    { label: "滤镜", mode: EditorMode.FILTER },
    { label: "文字", mode: EditorMode.TEXT },
    { label: "绘图", mode: EditorMode.DRAW },
  ];

  return (
    <View style={styles.toolbar}>
      {tools.map((tool) => (
        <ToolbarItem
          key={tool.mode}
          label={tool.label}
          mode={tool.mode}
          active={currentMode === tool.mode}
          onPress={() => setMode(tool.mode)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  toolItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(30, 30, 30, 0.8)",
  },
  activeToolItem: {
    backgroundColor: "#3478F6",
  },
  toolLabel: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  activeToolLabel: {
    fontWeight: "bold",
  },
});
