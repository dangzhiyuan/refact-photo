import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useEditorStore } from "../store/editorStore";
import Slider from "@react-native-community/slider";

interface ToolPanelProps {
  type: "filter" | "text" | "draw";
}

export const ToolPanel: React.FC<ToolPanelProps> = ({ type }) => {
  const { adjustments, updateAdjustments, currentFilter, setFilter } =
    useEditorStore((state) => ({
      adjustments: state.adjustments,
      updateAdjustments: state.updateAdjustments,
      currentFilter: state.currentFilter,
      setFilter: state.setFilter,
    }));

  // 滤镜面板
  const renderFilterPanel = () => {
    const filters = [
      { id: "normal", name: "原图" },
      { id: "filter1", name: "柔光" },
      { id: "filter2", name: "复古" },
      { id: "filter3", name: "黑白" },
      { id: "filter4", name: "清新" },
    ];

    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>滤镜</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterList}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterItem,
                currentFilter === filter.id && styles.activeFilterItem,
              ]}
              onPress={() => setFilter(filter.id)}
            >
              <View style={styles.filterPreview} />
              <Text style={styles.filterName}>{filter.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.adjustmentControls}>
          <AdjustmentControl
            label="亮度"
            value={adjustments.brightness}
            onChange={(value) => updateAdjustments({ brightness: value })}
          />
          <AdjustmentControl
            label="对比度"
            value={adjustments.contrast}
            onChange={(value) => updateAdjustments({ contrast: value })}
          />
          <AdjustmentControl
            label="饱和度"
            value={adjustments.saturation}
            onChange={(value) => updateAdjustments({ saturation: value })}
          />
        </View>
      </View>
    );
  };

  // 文本面板
  const renderTextPanel = () => {
    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>文本工具</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>添加文本</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // 绘图面板
  const renderDrawPanel = () => {
    const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"];

    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>绘图工具</Text>

        <View style={styles.colorList}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorItem, { backgroundColor: color }]}
            />
          ))}
        </View>

        <View style={styles.brushControls}>
          <Text style={styles.brushLabel}>笔触大小</Text>
          <Slider
            style={styles.brushSlider}
            minimumValue={1}
            maximumValue={20}
            step={1}
            value={5}
          />
        </View>
      </View>
    );
  };

  // 根据类型渲染相应面板
  switch (type) {
    case "filter":
      return renderFilterPanel();
    case "text":
      return renderTextPanel();
    case "draw":
      return renderDrawPanel();
    default:
      return null;
  }
};

// 调整控制组件
interface AdjustmentControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const AdjustmentControl: React.FC<AdjustmentControlProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <View style={styles.adjustmentControl}>
      <Text style={styles.adjustmentLabel}>{label}</Text>
      <Slider
        style={styles.adjustmentSlider}
        minimumValue={-100}
        maximumValue={100}
        value={value}
        onValueChange={onChange}
      />
      <Text style={styles.adjustmentValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: "rgba(30, 30, 30, 0.9)",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  panelTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },

  // 滤镜样式
  filterList: {
    flexDirection: "row",
    marginBottom: 16,
  },
  filterItem: {
    marginRight: 12,
    alignItems: "center",
  },
  activeFilterItem: {
    borderWidth: 2,
    borderColor: "#3478F6",
    borderRadius: 8,
  },
  filterPreview: {
    width: 80,
    height: 80,
    backgroundColor: "#666",
    borderRadius: 8,
    marginBottom: 8,
  },
  filterName: {
    color: "#FFFFFF",
    fontSize: 14,
  },

  // 调整控制样式
  adjustmentControls: {
    marginTop: 12,
  },
  adjustmentControl: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  adjustmentLabel: {
    color: "#FFFFFF",
    width: 60,
  },
  adjustmentSlider: {
    flex: 1,
    height: 40,
  },
  adjustmentValue: {
    color: "#FFFFFF",
    width: 40,
    textAlign: "right",
  },

  // 文本工具样式
  addButton: {
    backgroundColor: "#3478F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // 绘图工具样式
  colorList: {
    flexDirection: "row",
    marginBottom: 16,
  },
  colorItem: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  brushControls: {
    marginTop: 12,
  },
  brushLabel: {
    color: "#FFFFFF",
    marginBottom: 8,
  },
  brushSlider: {
    height: 40,
  },
});
