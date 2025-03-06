import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EditorMode } from "../core/types/canvas";
import { COLORS } from "../theme/colors";

// 定义可能的编辑器工具类型
export type ToolType = "layer" | EditorMode;

interface ToolbarProps {
  activeCanvas: string;
  onCanvasChange: (canvasType: string) => void;
  currentMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  // 新增：当前活动的工具类型
  activeTool: ToolType;
  // 新增：切换工具回调
  onToolChange: (tool: ToolType) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentMode,
  onModeChange,
  activeTool,
  onToolChange,
}) => {
  // 主工具选项
  const mainTools = [
    { id: "layer", name: "图层", icon: "layers-outline" },
    { id: EditorMode.EDIT, name: "调整", icon: "options-outline" },
    { id: EditorMode.FILTER, name: "滤镜", icon: "color-filter-outline" },
    { id: EditorMode.TEXT, name: "文字", icon: "text-outline" },
    { id: EditorMode.DRAW, name: "绘画", icon: "brush-outline" },
  ];

  // 创建处理工具点击的函数
  const handleToolPress = (toolId: ToolType) => {
    // 如果是当前已选中的工具，不需要做任何处理
    // 事件会冒泡到Editor中，由Editor判断是否切换面板可见性

    // 如果是EditorMode类型的工具，还需更新mode
    if (toolId !== "layer") {
      onModeChange(toolId as EditorMode);
    }

    // 更新活动工具
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
            <Ionicons
              name={tool.icon}
              size={22}
              color={
                activeTool === tool.id
                  ? COLORS.icon.active
                  : COLORS.icon.inactive
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
