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
import { StickerPanel } from "./panels/StickerPanel";
import { useCanvasStore } from "../store/canvasStore";
import { LayerType } from "../core/types/canvas";

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

  // 从 canvasStore 获取贴纸图层信息
  const { layers, layerIds } = useCanvasStore();

  // 过滤出贴纸类型的图层
  const stickerLayers = layerIds.filter(
    (id) => layers[id] && layers[id].type === LayerType.STICKER
  );

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
      // 特殊处理贴纸工具，防止闪烁
      if (tool === EditorMode.STICKER) {
        setActiveTool(tool);
        setMode(tool as EditorMode);
        // 确保面板始终可见
        setIsPanelVisible(true);
        return;
      }

      // 其他工具的处理
      if (tool === activeTool) {
        setIsPanelVisible(!isPanelVisible);
      } else {
        setActiveTool(tool);
        if (Object.values(EditorMode).includes(tool as EditorMode)) {
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
      [EditorMode.STICKER]: (
        <StickerPanel
          onClose={handlePanelClose}
          setActiveCanvas={setActiveCanvas}
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

  // 快速图层选择器组件
  const QuickLayerSelector: React.FC = () => {
    // 静态图层
    const staticLayers = [
      { id: "base", name: "基础图像", icon: "image-outline" },
      { id: "drawing", name: "画布1", icon: "brush-outline" },
      { id: "content", name: "画布2", icon: "text-outline" },
      { id: "control", name: "画布3", icon: "settings-outline" },
    ];

    // 合并静态图层和贴纸图层
    const stickerLayerItems = stickerLayers.map((id) => ({
      id,
      name: `贴纸 ${id.substring(id.length > 5 ? id.length - 5 : 0)}`,
      icon: "images-outline",
    }));

    const allLayers = [...staticLayers, ...stickerLayerItems];

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
                    : COLORS.icon.inactive
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

  // 贴纸操作处理函数
  const handleStickerDelete = useCallback(
    (layerId: string) => {
      // 删除贴纸前，如果它是当前选中的，先切换到基础图层
      if (activeCanvas === layerId) {
        setActiveCanvas("base");
      }

      // 调用删除函数
      const { deleteLayer } = useCanvasStore.getState();
      if (deleteLayer) {
        deleteLayer(layerId);
      }
    },
    [activeCanvas, setActiveCanvas]
  );

  // 贴纸选择处理函数
  const handleStickerSelect = useCallback(
    (layerId: string) => {
      // 直接切换到该贴纸图层
      setActiveCanvas(layerId);
    },
    [setActiveCanvas]
  );

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

      {/* 快速图层选择器 */}
      <QuickLayerSelector />

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
  quickLayerSelector: {
    flexDirection: "row",
    padding: 10,
  },
  layerButton: {
    padding: 10,
  },
  activeLayerButton: {
    backgroundColor: COLORS.accent,
  },
  layerButtonText: {
    marginTop: 5,
  },
  activeLayerButtonText: {
    fontWeight: "bold",
  },
});

// 添加图层选择器样式
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
