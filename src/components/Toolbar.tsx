import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Icon } from "./common/Icon";
import { EditorMode } from "../core/types/canvas";
import { COLORS } from "../theme/colors";

export type ToolType = EditorMode;

interface ToolbarProps {
  activeCanvas: string;
  onCanvasChange: (canvasType: string) => void;
  currentMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentMode,
  onModeChange,
  activeTool,
  onToolChange,
}) => {
  const mainTools = [
    { id: "layer", name: "图层", icon: "layers" },
    { id: EditorMode.EDIT, name: "调整", icon: "options" },
    { id: EditorMode.FILTER, name: "滤镜", icon: "color-filter" },
    { id: EditorMode.TEXT, name: "文字", icon: "text" },
    { id: EditorMode.DRAW, name: "绘画", icon: "brush" },
  ];

  const handleToolPress = (toolId: ToolType) => {
    onToolChange(toolId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolsRow}>
        {mainTools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={[
              styles.toolButton,
              activeTool === tool.id && styles.activeToolButton,
            ]}
            onPress={() => handleToolPress(tool.id as ToolType)}
          >
            <Icon
              name={tool.icon}
              size={22}
              color={
                activeTool === tool.id ? COLORS.accent : COLORS.icon.inactive
              }
            />
            <Text
              style={[
                styles.buttonText,
                activeTool === tool.id && styles.activeButtonText,
              ]}
            >
              {tool.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.panelBackground,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  toolsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  toolButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    minWidth: 64,
  },
  activeToolButton: {
    backgroundColor: COLORS.accent + "15",
  },
  buttonText: {
    fontSize: 12,
    marginTop: 4,
    color: COLORS.text.secondary,
    fontWeight: "500",
  },
  activeButtonText: {
    color: COLORS.accent,
    fontWeight: "600",
  },
});
