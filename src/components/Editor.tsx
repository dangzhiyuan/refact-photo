import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Icon } from "./common/Icon";
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

interface CanvasSize {
  width: number;
  height: number;
}

export const Editor: React.FC = () => {
  const currentMode = useEditorStore((state) => state.currentMode);
  const setMode = useEditorStore((state) => state.setMode);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [activeCanvas, setActiveCanvas] = useState("base");
  const [activeTool, setActiveTool] = useState<ToolType>(EditorMode.EDIT);
  const navigation = useNavigation();
  const { visibleLayers, toggleLayerVisibility } = useLayerVisibility();
  const [imageDimensions, setImageDimensions] = useState({
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT - 40,
  });

  const handleCanvasSizeChange = useCallback((size: CanvasSize) => {
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
    // TODO: 实现实际的保存功能
  }, []);

  const handleToolChange = useCallback(
    (tool: ToolType) => {
      if (tool === activeTool) {
        setIsPanelVisible(!isPanelVisible);
      } else {
        setActiveTool(tool);
        if (
          tool !== "layer" &&
          Object.values(EditorMode).includes(tool as EditorMode)
        ) {
          setMode(tool as EditorMode);
        }

        setIsPanelVisible(true);
      }
    },
    [activeTool, isPanelVisible, setMode]
  );

  const renderToolPanel = useCallback(() => {
    if (!isPanelVisible) return null;
    const handlePanelClose = () => setIsPanelVisible(false);
    const panels: Record<string, React.ReactNode> = {
      [EditorMode.FILTER]: (
        <FilterPanel onIntensityToggle={() => {}} onClose={handlePanelClose} />
      ),
      [EditorMode.DRAW]: <DrawingPanel onClose={handlePanelClose} />,
      [EditorMode.TEXT]: <TextPanel onClose={handlePanelClose} />,
      [EditorMode.EDIT]: <AdjustmentPanel onClose={handlePanelClose} />,
      [EditorMode.LAYER]: (
        <LayerPanel
          activeCanvas={activeCanvas}
          onCanvasChange={setActiveCanvas}
          onClose={handlePanelClose}
          visibleLayers={visibleLayers}
          onToggleVisibility={toggleLayerVisibility}
        />
      ),
    };
    return panels[activeTool] || null;
  }, [
    activeTool,
    isPanelVisible,
    activeCanvas,
    visibleLayers,
    toggleLayerVisibility,
  ]);

  const viewportConfig = {
    backgroundColor: COLORS.canvasBackground,
    borderRadius: 15,
    useGradient: true,
    paddingHorizontal: 0,
    paddingVertical: 0,
    initialScale: 0.8,
    fitScale: 0.85,
    borderStyle: "corners" as const,
    shadowProps: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部工具栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
          <Icon name="close" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
          <Icon name="checkmark" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* 画布视窗 */}
      <View
        style={{
          alignSelf: "center",
          alignItems: "center",
          justifyContent: "center",
          width: imageDimensions.width,
          height: imageDimensions.height,
        }}
      >
        <CanvasViewport
          activeCanvas={activeCanvas}
          setActiveCanvas={setActiveCanvas}
          visibleLayers={visibleLayers}
          onCanvasSizeChange={handleCanvasSizeChange}
          {...viewportConfig}
        />
      </View>

      {/* 底部工具区域 */}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  panelContainer: {
    flex: 1,
  },
});
