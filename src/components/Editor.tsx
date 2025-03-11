import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from "react-native";
import { Icon } from "./common/Icon";
import { CanvasManager } from "./CanvasManager";
import { FilterPanel } from "./panels/FilterPanel";
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
import { StickerPanel } from "./panels/StickerPanel";
import { useCanvasStore } from "../store/canvasStore";
import { LayerType } from "../core/types/canvas";
import { DrawingPanel } from "./panels/DrawingPanel";
import { DrawingCanvas } from "./canvas/DrawingCanvas";

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
    width: SCREEN_WIDTH - 20,
    height: SCREEN_HEIGHT * 0.6,
  });

  const { layers, layerIds } = useCanvasStore();

  const stickerLayers = layerIds.filter(
    (id) => layers[id] && layers[id].type === LayerType.STICKER
  );

  const handleCanvasSizeChange = useCallback((size: CanvasSize) => {
    if (size.width > 0 && size.height > 0) {
      setImageDimensions(size);
    }
  }, []);

  const handleClose = useCallback(() => {
    // 退出前重置所有图层数据
    const { resetLayers } = useCanvasStore.getState();
    resetLayers();

    navigation.goBack();
  }, [navigation]);

  const handleSave = useCallback(() => {
    // 实际保存图片功能需要在此实现
  }, []);

  const handleToolChange = useCallback(
    (tool: ToolType) => {
      console.log("Tool change:", {
        currentTool: activeTool,
        newTool: tool,
        currentMode,
        isPanelVisible,
      });

      // 如果切换到不同的工具，先设置模式再设置工具
      if (tool !== activeTool) {
        console.log("Setting new mode:", tool);
        // 先设置模式
        if (Object.values(EditorMode).includes(tool as EditorMode)) {
          setMode(tool as EditorMode);
          // 等待一帧后再设置工具，确保模式变化已经生效
          requestAnimationFrame(() => {
            setActiveTool(tool);
          });
        } else {
          setActiveTool(tool);
        }
      }

      // 处理面板可见性
      if (tool === activeTool) {
        setIsPanelVisible(!isPanelVisible);
      } else {
        setIsPanelVisible(true);
      }
    },
    [activeTool, isPanelVisible, setMode, currentMode]
  );

  const MemoizedStickerPanel = React.memo(
    ({
      onClose,
      setActiveCanvas,
    }: {
      onClose?: () => void;
      setActiveCanvas?: (id: string) => void;
    }) => {
      return (
        <StickerPanel onClose={onClose} setActiveCanvas={setActiveCanvas} />
      );
    }
  );

  const renderToolPanel = useCallback(() => {
    if (!isPanelVisible) return null;
    const handlePanelClose = () => setIsPanelVisible(false);
    const panels: Record<string, React.ReactNode> = {
      [EditorMode.FILTER]: (
        <FilterPanel onIntensityToggle={() => {}} onClose={handlePanelClose} />
      ),
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
      [EditorMode.STICKER]: (
        <MemoizedStickerPanel
          onClose={handlePanelClose}
          setActiveCanvas={setActiveCanvas}
        />
      ),
      [EditorMode.DRAW]: <DrawingPanel onClose={handlePanelClose} />,
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
    initialScale: 0.95,
    fitScale: 0.95,
    borderStyle: "corners" as const,
    shadowProps: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
  };

  const QuickLayerSelector: React.FC = () => {
    const staticLayers = [
      { id: "base", name: "基础图像", icon: "image-outline" },
      { id: "content", name: "圆形画布", icon: "ellipse-outline" },
    ];

    const stickerLayerItems = stickerLayers.map((id) => ({
      id,
      name: `贴纸 ${id.substring(id.length > 5 ? id.length - 5 : 0)}`,
      icon: "images-outline",
    }));

    const drawingLayers = layerIds
      .filter((id) => layers[id] && layers[id].type === LayerType.DRAWING)
      .map((id) => ({
        id,
        name: `绘画 ${id.substring(id.length > 5 ? id.length - 5 : 0)}`,
        icon: "brush-outline",
      }));

    const allLayers = [...staticLayers, ...stickerLayerItems, ...drawingLayers];

    return (
      <View style={layerSelectorStyles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {allLayers.map((layer) => (
            <TouchableOpacity
              key={layer.id}
              style={[
                layerSelectorStyles.layerButton,
                activeCanvas === layer.id &&
                  layerSelectorStyles.activeLayerButton,
              ]}
              onPress={() => setActiveCanvas(layer.id)}
            >
              <Icon
                name={layer.icon}
                size={18}
                color={
                  activeCanvas === layer.id
                    ? COLORS.accent
                    : COLORS.text.secondary
                }
              />
              <Text
                style={[
                  layerSelectorStyles.layerButtonText,
                  activeCanvas === layer.id &&
                    layerSelectorStyles.activeLayerButtonText,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {layer.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const handleRemoveSticker = useCallback(
    (layerId: string) => {
      try {
        if (activeCanvas === layerId) {
          setActiveCanvas("base");
        }

        const { deleteLayer } = useCanvasStore.getState();
        deleteLayer(layerId);
      } catch (error) {
        // 处理错误
      }
    },
    [activeCanvas, setActiveCanvas]
  );

  const handleStickerSelect = useCallback(
    (layerId: string) => {
      setActiveCanvas(layerId);
    },
    [setActiveCanvas]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
          <Icon name="close" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
          <Icon name="checkmark" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <QuickLayerSelector />

      <View
        style={{
          height: "50%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: imageDimensions.width,
            height: imageDimensions.height,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            borderWidth: 1,
            borderColor: "rgba(0, 255, 0, 0.2)",
          }}
        >
          <CanvasViewport
            activeCanvas={activeCanvas}
            setActiveCanvas={setActiveCanvas}
            visibleLayers={visibleLayers}
            onCanvasSizeChange={handleCanvasSizeChange}
            {...viewportConfig}
          />
          {currentMode === EditorMode.DRAW && (
            <View style={StyleSheet.absoluteFill}>
              <DrawingCanvas
                width={imageDimensions.width}
                height={imageDimensions.height}
                onLayerCreated={(layerId) => {
                  // 只切换活动图层，不自动切换模式
                  setActiveCanvas(layerId);
                }}
              />
            </View>
          )}
        </View>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  panelContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
});

// 图层选择器样式
const layerSelectorStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.panelBackground,
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  layerButton: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    minWidth: 60,
  },
  activeLayerButton: {
    backgroundColor: COLORS.accent + "15",
  },
  layerButtonText: {
    fontSize: 10,
    marginTop: 4,
    color: COLORS.text.secondary,
    textAlign: "center",
    maxWidth: 60,
  },
  activeLayerButtonText: {
    color: COLORS.accent,
    fontWeight: "600",
  },
});
