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
    { id: "base", name: "基础图像", icon: "image-outline" },
    { id: "drawing", name: "画布1", icon: "brush-outline" },
    { id: "content", name: "画布2", icon: "text-outline" },
    { id: "control", name: "画布3", icon: "settings-outline" },
  ];

  // 从 canvasStore 获取贴纸图层
  const { layers, layerIds } = useCanvasStore();

  // 过滤出所有贴纸类型的图层
  const stickerLayers = layerIds
    .filter((id) => layers[id] && layers[id].type === LayerType.STICKER)
    .map((id) => ({
      id,
      name: `贴纸 ${id.substring(id.length - 5)}`, // 使用ID的最后5个字符作为名称后缀
      icon: "images-outline",
      type: LayerType.STICKER,
    }));

  // 合并静态画布和动态贴纸图层
  const allLayers = [...staticCanvasOptions, ...stickerLayers];

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
          // 检查图层是否是贴纸类型
          const isSticker = layer.type === LayerType.STICKER;

          return (
            <TouchableOpacity
              key={layer.id}
              style={[
                styles.layerItem,
                activeCanvas === layer.id && styles.activeLayerItem,
                isSticker && styles.stickerLayerItem, // 为贴纸图层添加特殊样式
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
                  isSticker && styles.stickerLayerName, // 为贴纸图层名称添加特殊样式
                ]}
              >
                {layer.name}
              </Text>
              <View style={styles.layerActions}>
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
