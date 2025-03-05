import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { CanvasManager } from "./CanvasManager";
import { FilterPanel } from "./panels/FilterPanel";
import { DrawingPanel } from "./panels/DrawingPanel";
import { TextPanel } from "./panels/TextPanel";
import { AdjustmentPanel } from "./panels/AdjustmentPanel";
import { useEditorStore } from "../store/editorStore";
import { EditorMode } from "../core/types/canvas";

export const Editor: React.FC = () => {
  // 使用 useCallback 包装从 store 获取的函数，避免重新创建函数
  const currentMode = useEditorStore((state) => state.currentMode);
  const setMode = useEditorStore((state) => state.setMode);

  // 本地状态
  const [intensityVisible, setIntensityVisible] = useState(false);
  // 添加面板可见性状态
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  // 使用 useCallback 优化事件处理函数
  const handleClose = useCallback(() => {
    console.log("关闭编辑器");
    // 添加导航逻辑
  }, []);

  const handleSave = useCallback(() => {
    console.log("保存图片");
    // 导出图片逻辑
  }, []);

  const handleIntensityToggle = useCallback(() => {
    setIntensityVisible((prev) => !prev);
  }, []);

  // 修改模式切换函数，添加面板切换逻辑
  const handleModeChange = useCallback(
    (mode: EditorMode) => {
      if (mode === currentMode) {
        // 如果点击的是当前已选中的模式，切换面板可见性
        setIsPanelVisible(!isPanelVisible);
      } else {
        // 如果点击的是不同的模式，切换模式并显示面板
        setMode(mode);
        setIsPanelVisible(true);
      }
    },
    [currentMode, isPanelVisible, setMode]
  );

  // 渲染当前工具面板 - 使用 useCallback 避免重新创建
  const renderToolPanel = useCallback(() => {
    // 如果面板不可见，返回null
    if (!isPanelVisible) return null;

    switch (currentMode) {
      case EditorMode.FILTER:
        return <FilterPanel onIntensityToggle={handleIntensityToggle} />;
      case EditorMode.DRAW:
        return <DrawingPanel />;
      case EditorMode.TEXT:
        return <TextPanel />;
      case EditorMode.EDIT:
        return <AdjustmentPanel />;
      default:
        return null;
    }
  }, [currentMode, handleIntensityToggle, isPanelVisible]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
          <Ionicons name="checkmark" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* 主要内容区域 */}
      <View style={styles.canvasContainer}>
        <CanvasManager />
      </View>

      {/* 强度滑块区域 */}
      {intensityVisible && (
        <View style={styles.intensityContainer}>
          <View style={styles.intensitySlider}>
            <Text style={styles.intensityValue}>94</Text>
          </View>
        </View>
      )}

      {/* 工具面板 */}
      {renderToolPanel()}

      {/* 底部工具栏 */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[
            styles.toolButton,
            currentMode === EditorMode.EDIT && styles.activeToolButton,
          ]}
          onPress={() => handleModeChange(EditorMode.EDIT)}
        >
          <MaterialIcons name="tune" size={24} color="#FFF" />
          <Text style={styles.toolText}>调整</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolButton,
            currentMode === EditorMode.FILTER && styles.activeToolButton,
          ]}
          onPress={() => handleModeChange(EditorMode.FILTER)}
        >
          <MaterialIcons name="auto-fix-high" size={24} color="#FFF" />
          <Text style={styles.toolText}>滤镜</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolButton,
            currentMode === EditorMode.TEXT && styles.activeToolButton,
          ]}
          onPress={() => handleModeChange(EditorMode.TEXT)}
        >
          <MaterialIcons name="title" size={24} color="#FFF" />
          <Text style={styles.toolText}>文字</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolButton,
            currentMode === EditorMode.DRAW && styles.activeToolButton,
          ]}
          onPress={() => handleModeChange(EditorMode.DRAW)}
        >
          <MaterialIcons name="brush" size={24} color="#FFF" />
          <Text style={styles.toolText}>绘画</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
  },
  canvasContainer: {
    flex: 1,
  },
  intensityContainer: {
    height: 50,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  intensitySlider: {
    width: "100%",
    height: 30,
    backgroundColor: "rgba(50, 50, 50, 0.5)",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 10,
  },
  intensityValue: {
    color: "#fff",
    fontWeight: "bold",
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingBottom: 30, // 增加底部空间，适应没有安全区域的设备
  },
  toolButton: {
    alignItems: "center",
    padding: 8,
  },
  activeToolButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
  },
  toolText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
});
