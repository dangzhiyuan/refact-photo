import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { useCanvasStore } from "../../store/useCanvasStore";
import { useImagePicker } from "./ImagePicker";
import { MaterialIcons } from "@expo/vector-icons";
import { SubToolbar } from "./SubToolbar";
import { useState } from "react";
import { FilterName } from "./filters/shaders/FilterShader";
import { ImageLayer } from "../../types/layer";
import { createTextLayer } from "../../store/useCanvasStore";

type ToolType = "filter" | "template" | "draw" | "text" | "sticker";

interface Tool {
  type: ToolType;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
}

export const Toolbar = () => {
  const { layers, updateLayer, selectedLayerId, addLayer } = useCanvasStore();
  const { pickImage } = useImagePicker();
  const [activeSubTool, setActiveSubTool] = useState<ToolType | null>(null);

  // 处理滤镜变化
  const handleFilterChange = (type: FilterName, intensity: number) => {
    console.log("Applying filter:", {
      type,
      intensity,
      selectedLayerId,
      hasSelectedLayer: !!selectedLayerId,
    });

    if (!selectedLayerId) {
      console.warn("No layer selected, selecting first layer");
      // 如果没有选中的图层，默认选择第一个图层
      if (layers.length > 0) {
        updateLayer(layers[0].id, {
          filterType: type,
          filterIntensity: intensity,
        });
      }
      return;
    }

    updateLayer(selectedLayerId, {
      filterType: type,
      filterIntensity: intensity,
    });
  };

  const handleAddText = () => {
    const newTextLayer = createTextLayer();
    addLayer(newTextLayer);
  };

  const tools: Tool[] = [
    { type: "filter", icon: "tune", label: "滤镜" },
    { type: "template", icon: "dashboard", label: "模板" },
    { type: "draw", icon: "brush", label: "涂鸦" },
    { type: "text", icon: "text-fields", label: "文字" },
    { type: "sticker", icon: "tag", label: "贴纸" },
  ];

  // 如果没有图层，显示选择照片按钮
  if (layers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>选择照片</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 获取第一个图层的图片源（如果是图片图层）
  const firstLayer = layers[0];
  const imageUri =
    firstLayer?.type === "image" ? firstLayer.imageSource : undefined;

  return (
    <>
      <SubToolbar
        type={activeSubTool}
        imageUri={imageUri}
        onFilterChange={handleFilterChange}
      />
      <View style={styles.toolbar}>
        {tools.map((tool) => (
          <TouchableOpacity
            key={tool.type}
            style={[
              styles.toolButton,
              activeSubTool === tool.type && styles.activeToolButton,
            ]}
            onPress={() => {
              setActiveSubTool(activeSubTool === tool.type ? null : tool.type);
            }}
          >
            <MaterialIcons
              name={tool.icon}
              size={24}
              color={activeSubTool === tool.type ? "#007AFF" : "#333"}
            />
            <Text
              style={[
                styles.toolLabel,
                activeSubTool === tool.type && styles.activeToolLabel,
              ]}
            >
              {tool.label}
            </Text>
          </TouchableOpacity>
        ))}
        {activeSubTool === "text" && (
          <TouchableOpacity onPress={handleAddText} style={styles.toolButton}>
            <MaterialIcons name="text-fields" size={24} color="#333" />
            <Text style={styles.toolLabel}>文字</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  emptyButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  toolbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingBottom: 20,
  },
  toolButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  toolLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#333",
  },
  activeToolButton: {
    backgroundColor: "#f0f0f0",
  },
  activeToolLabel: {
    color: "#007AFF",
  },
});
