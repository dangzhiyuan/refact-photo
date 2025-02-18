import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { FilterPanel } from "../panels/FilterPanel";
import { ToolButton } from "./ToolButton";
import { useLayerStore } from "../../../store/useLayerStore";
import { ToolType } from "../../../types/tools";

interface Tool {
  id: ToolType;
  icon: string;
  label: string;
  disabled?: boolean;
}

export const Toolbar = () => {
  const [activePanel, setActivePanel] = useState<string | null>(null);
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

  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        {tools.map((tool) => (
          <ToolButton
            key={tool.id}
            icon={tool.icon}
            label={tool.label}
            isActive={activePanel === tool.id}
            disabled={tool.disabled}
            onPress={() =>
              setActivePanel(activePanel === tool.id ? null : tool.id)
            }
          />
        ))}
      </View>

      {activePanel === "filter" && (
        <FilterPanel onClose={() => setActivePanel(null)} />
      )}
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
  },
  buttons: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
});
