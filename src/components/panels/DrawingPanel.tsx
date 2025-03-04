import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { useDrawingStore } from "../../store/drawingStore";
import { BrushType } from "../../types/drawing";

// 可选颜色
const COLORS = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF"
];

// 可选笔刷宽度
const BRUSH_WIDTHS = [2, 5, 10, 15, 20];

// 画笔预览
// 尝试导入图片，如果失败则使用颜色块代替
const BRUSH_PREVIEWS = {
  // 使用 try-catch 会导致编译错误，所以我们使用条件渲染
  [BrushType.Normal]: 'normal',
  [BrushType.BlackBorder]: 'black-border',
};

export const DrawingPanel = () => {
  const { 
    color, 
    brushWidth, 
    brushType, // 新增画笔类型状态
    setColor, 
    setBrushWidth,
    setBrushType, // 新增设置画笔类型函数
    clearAll, 
    undo 
  } = useDrawingStore();
  
  return (
    <View style={styles.container}>
      {/* 画笔类型选择器 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>画笔类型</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.values(BrushType).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.brushTypeOption,
                brushType === type && styles.selectedOption
              ]}
              onPress={() => setBrushType(type)}
            >
              {/* 使用颜色块代替图片 */}
              <View 
                style={[
                  styles.brushPreviewPlaceholder,
                  { backgroundColor: type === BrushType.BlackBorder ? '#333' : '#666' }
                ]} 
              />
              <Text style={styles.brushTypeText}>{getBrushTypeName(type)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* 颜色选择器 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>颜色</Text>
        <View style={styles.colorPicker}>
          {COLORS.map((clr) => (
            <TouchableOpacity
              key={clr}
              style={[
                styles.colorOption,
                { backgroundColor: clr },
                color === clr && styles.selectedColorOption
              ]}
              onPress={() => setColor(clr)}
            />
          ))}
        </View>
      </View>
      
      {/* 笔刷宽度选择器 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>笔刷宽度</Text>
        <View style={styles.brushWidthPicker}>
          {BRUSH_WIDTHS.map((width) => (
            <TouchableOpacity
              key={width}
              style={[
                styles.brushOption,
                brushWidth === width && styles.selectedBrushOption
              ]}
              onPress={() => setBrushWidth(width)}
            >
              <View style={[styles.brushPreview, { height: width, width: width * 3 }]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* 操作按钮 */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={undo}>
          <Text style={styles.actionText}>撤销</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={clearAll}>
          <Text style={styles.actionText}>清除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// 获取画笔类型的显示名称
function getBrushTypeName(type: BrushType): string {
  switch (type) {
    case BrushType.Normal:
      return "普通";
    case BrushType.BlackBorder:
      return "黑边";
    case BrushType.Eraser:
      return "橡皮擦";
    // 其他画笔类型...
    default:
      return "未知";
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: "#000",
  },
  brushWidthPicker: {
    flexDirection: "row",
    alignItems: "center",
  },
  brushOption: {
    padding: 10,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBrushOption: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  brushPreview: {
    backgroundColor: "#000",
    borderRadius: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
  actionText: {
    fontWeight: "bold",
  },
  brushTypeOption: {
    padding: 10,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedOption: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  brushPreviewPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  brushTypeText: {
    marginTop: 5,
    fontWeight: "bold",
  },
}); 