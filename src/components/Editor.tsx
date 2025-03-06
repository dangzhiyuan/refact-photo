import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { CanvasManager } from "./CanvasManager";
import { FilterPanel } from "./panels/FilterPanel";
import { DrawingPanel } from "./panels/DrawingPanel";
import { TextPanel } from "./panels/TextPanel";
import { AdjustmentPanel } from "./panels/AdjustmentPanel";
import { useEditorStore } from "../store/editorStore";
import { EditorMode } from "../core/types/canvas";
import { Toolbar } from "./Toolbar";
import { LayerPanel } from "./panels/LayerPanel";
import { ToolType } from "./Toolbar";
import { useNavigation } from "@react-navigation/native";
import { CanvasViewport } from "./canvas/CanvasViewport";
import { COLORS } from "../theme/colors";
import { useLayerVisibility } from "../hooks/useLayerVisibility";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export const Editor: React.FC = () => {
  const currentMode = useEditorStore((state) => state.currentMode);
  const setMode = useEditorStore((state) => state.setMode);

  const [intensityVisible, setIntensityVisible] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [activeCanvas, setActiveCanvas] = useState("base");
  const [activeTool, setActiveTool] = useState<ToolType>(EditorMode.EDIT);
  const navigation = useNavigation();
  const { visibleLayers, toggleLayerVisibility } = useLayerVisibility();
  const [imageDimensions, setImageDimensions] = useState({
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT - 40,
  });

  const handleCanvasSizeChange = useCallback((size) => {
    console.log("Canvas size changed:", size);
    if (size.width > 0 && size.height > 0) {
      setImageDimensions(size);
    }
  }, []);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSave = useCallback(() => {
    console.log("保存图片");
  }, []);

  const handleIntensityToggle = useCallback(() => {
    setIntensityVisible((prev) => !prev);
  }, []);

  const handleModeChange = useCallback(
    (mode: EditorMode) => {
      if (mode === currentMode) {
        setIsPanelVisible(!isPanelVisible);
      } else {
        setMode(mode);
        setIsPanelVisible(true);
      }
    },
    [currentMode, isPanelVisible, setMode]
  );

  const handleToolChange = useCallback(
    (tool: ToolType) => {
      if (tool === activeTool) {
        setIsPanelVisible(!isPanelVisible);
      } else {
        setActiveTool(tool);
        setIsPanelVisible(true);
      }
    },
    [activeTool, isPanelVisible]
  );
  const renderToolPanel = useCallback(() => {
    if (!isPanelVisible) return null;
    const handlePanelClose = () => {
      setIsPanelVisible(false);
    };
    if (activeTool === "layer") {
      return (
        <LayerPanel
          activeCanvas={activeCanvas}
          onCanvasChange={setActiveCanvas}
          onClose={handlePanelClose}
          visibleLayers={visibleLayers}
          onToggleVisibility={toggleLayerVisibility}
        />
      );
    }
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
  }, [
    currentMode,
    handleIntensityToggle,
    isPanelVisible,
    activeTool,
    activeCanvas,
    visibleLayers,
    toggleLayerVisibility,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
          <Ionicons name="checkmark" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          alignSelf: "center",
          alignItems: "center",
          justifyContent: "center",
          width: imageDimensions.width,
          height: imageDimensions.height,
          // 添加边框可以检查容器是否与图片尺寸匹配（调试用）
          // borderWidth: 1,
          // borderColor: 'red',
        }}
      >
        <CanvasViewport
          activeCanvas={activeCanvas}
          setActiveCanvas={setActiveCanvas}
          backgroundColor={COLORS.canvasBackground}
          borderRadius={15}
          useGradient={true}
          paddingHorizontal={0}
          paddingVertical={0}
          initialScale={0.8}
          fitScale={0.85}
          borderStyle="corners"
          shadowProps={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }}
          visibleLayers={visibleLayers}
          onCanvasSizeChange={handleCanvasSizeChange}
        />
      </View>

      <View style={[styles.toolsSection, { flex: 1 }]}>
        <Toolbar
          activeCanvas={activeCanvas}
          onCanvasChange={setActiveCanvas}
          currentMode={currentMode}
          onModeChange={setMode}
          activeTool={activeTool}
          onToolChange={handleToolChange}
        />
        <View style={styles.panelContainer}>{renderToolPanel()}</View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerButton: {
    padding: 8,
  },
  toolsSection: {
    flexDirection: "column",
    backgroundColor: COLORS.panelBackground,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginTop: 5,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
    // 添加阴影效果
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  panelContainer: {
    flex: 1,
  },
  intensityContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
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
