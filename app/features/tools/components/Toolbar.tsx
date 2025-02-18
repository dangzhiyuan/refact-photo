import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { ToolButton } from "./ToolButton";
import { FilterMenu } from "../filters/components/FilterMenu";
import { useLayerStore } from "../../../store/useLayerStore";
import { ToolType } from "../../../types/tools";

interface Tool {
  id: ToolType;
  icon: string;
  label: string;
  disabled?: boolean;
}

export const Toolbar = () => {
  const [selectedTool, setSelectedTool] = useState<ToolType>(null);
  const { selectedLayerId, layers } = useLayerStore();

  // 获取选中的图层
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);

  const tools: Tool[] = [
    {
      id: "filter",
      icon: "magic",
      label: "滤镜",
      disabled: !selectedLayer || selectedLayer.type !== "image",
    },
    // ... 其他工具
  ];

  // 渲染工具面板
  const renderPanel = () => {
    if (!selectedTool) return null;

    switch (selectedTool) {
      case "filter":
        return <FilterMenu />;
      // ... 其他工具面板
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* 工具按钮列表 */}
      <View style={styles.toolbar}>
        {tools.map((tool) => (
          <ToolButton
            key={tool.id}
            icon={tool.icon}
            label={tool.label}
            isActive={selectedTool === tool.id}
            disabled={tool.disabled}
            onPress={() =>
              setSelectedTool(selectedTool === tool.id ? null : tool.id)
            }
          />
        ))}
      </View>

      {/* 工具面板 */}
      <View style={styles.panel}>{renderPanel()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 8,
  },
  panel: {
    minHeight: 0,
    maxHeight: 300,
  },
});
