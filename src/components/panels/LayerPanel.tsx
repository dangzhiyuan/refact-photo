import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import { Icon } from "../common/Icon";
import { ComponentProps } from "react";
import { COLORS } from "../../theme/colors";
import { useCanvasStore } from "../../store/canvasStore";
import { CanvasType, LayerType } from "../../core/types/canvas";

interface LayerPanelProps {
  activeCanvas: string;
  onCanvasChange: (canvasType: string) => void;
  onClose?: () => void;
  visibleLayers: Record<string, boolean>;
  onToggleVisibility: (layerId: string) => void;
}

// 定义图层选项的接口
interface LayerOption {
  id: string;
  name: string;
  icon: string;
  type?: LayerType; // 添加可选的 type 属性
  zIndex?: number; // 添加可选的 zIndex 属性
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  activeCanvas,
  onCanvasChange,
  onClose,
  visibleLayers,
  onToggleVisibility,
}) => {
  // 获取固定的画布选项
  const staticCanvasOptions: LayerOption[] = [
    { id: "base", name: "基础图像", icon: "image-outline", zIndex: 1 },
    { id: "content", name: "圆形画布", icon: "ellipse-outline", zIndex: 2 },
  ];

  // 从 canvasStore 获取图层和操作
  const { layers, layerIds, moveLayerUp, moveLayerDown } = useCanvasStore();

  // 过滤出所有贴纸类型的图层
  const stickerLayers = layerIds
    .filter((id) => layers[id] && layers[id].type === LayerType.STICKER)
    .map((id) => ({
      id,
      name: `贴纸 ${id.substring(id.length - 5)}`, // 使用ID的最后5个字符作为名称后缀
      icon: "images-outline",
      type: LayerType.STICKER,
      zIndex: layers[id].zIndex,
    }));

  // 过滤出所有绘画类型的图层
  const drawingLayers = layerIds
    .filter((id) => layers[id] && layers[id].type === LayerType.DRAWING)
    .map((id) => ({
      id,
      name: `绘画 ${id.substring(id.length - 5)}`, // 使用ID的最后5个字符作为名称后缀
      icon: "brush-outline",
      type: LayerType.DRAWING,
      zIndex: layers[id].zIndex,
    }));

  // 合并用户创建的图层并按zIndex排序（从高到低）
  const userLayers = [...stickerLayers, ...drawingLayers].sort(
    (a, b) => (b.zIndex || 0) - (a.zIndex || 0)
  );

  // 合并静态画布和动态图层
  const allLayers = [...userLayers, ...staticCanvasOptions];

  // 处理向上移动图层
  const handleMoveUp = (id: string) => {
    moveLayerUp(id);
  };

  // 处理向下移动图层
  const handleMoveDown = (id: string) => {
    moveLayerDown(id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>图层</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close-outline" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={styles.content}>
        {allLayers.map((layer) => {
          // 检查图层是否是用户创建的图层（贴纸或绘画）
          const isUserLayer =
            layer.type === LayerType.STICKER ||
            layer.type === LayerType.DRAWING;
          // 检查是否为静态画布
          const isStaticCanvas = !isUserLayer;

          return (
            <TouchableOpacity
              key={layer.id}
              style={[
                styles.layerItem,
                activeCanvas === layer.id && styles.activeLayerItem,
                layer.type === LayerType.STICKER && styles.stickerLayerItem,
                layer.type === LayerType.DRAWING && styles.drawingLayerItem,
              ]}
              onPress={() => onCanvasChange(layer.id)}
            >
              <Icon
                name={layer.icon}
                size={22}
                color={
                  activeCanvas === layer.id
                    ? COLORS.accent
                    : COLORS.icon.inactive
                }
              />
              <Text
                style={[
                  styles.layerName,
                  activeCanvas === layer.id && styles.activeLayerName,
                  layer.type === LayerType.STICKER && styles.stickerLayerName,
                ]}
              >
                {layer.name}
              </Text>
              <View style={styles.layerActions}>
                {/* 显示/隐藏按钮 */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onToggleVisibility(layer.id)}
                >
                  <Icon
                    name={
                      visibleLayers[layer.id] !== false
                        ? "eye-outline"
                        : "eye-off-outline"
                    }
                    size={20}
                    color={
                      visibleLayers[layer.id] !== false
                        ? COLORS.accent
                        : COLORS.icon.inactive
                    }
                  />
                </TouchableOpacity>

                {/* 只为用户创建的图层显示上移下移按钮 */}
                {isUserLayer && (
                  <>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleMoveUp(layer.id)}
                    >
                      <Icon
                        name="arrow-up-outline"
                        size={20}
                        color={COLORS.icon.inactive}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleMoveDown(layer.id)}
                    >
                      <Icon
                        name="arrow-down-outline"
                        size={20}
                        color={COLORS.icon.inactive}
                      />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.panelBackground,
    borderRadius: 12,
    margin: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
  },
  layersList: {
    paddingBottom: 8,
  },
  layerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: COLORS.canvasBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeLayerItem: {
    backgroundColor: COLORS.accent + "15",
    borderColor: COLORS.accent + "30",
  },
  stickerLayerItem: {
    backgroundColor: COLORS.accent + "08", // 给贴纸图层添加轻微的不同背景
  },
  drawingLayerItem: {
    backgroundColor: COLORS.accent + "05", // 给绘画图层添加轻微的不同背景，使用不同透明度区分
  },
  layerName: {
    flex: 1,
    marginLeft: 16,
    fontSize: 15,
    color: COLORS.text.secondary,
  },
  activeLayerName: {
    color: COLORS.accent,
    fontWeight: "600",
  },
  stickerLayerName: {
    fontStyle: "italic", // 贴纸图层的名称使用斜体
  },
  layerActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 6,
  },
  closeButton: {
    padding: 4,
  },
});
