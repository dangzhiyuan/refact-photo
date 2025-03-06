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

interface LayerPanelProps {
  activeCanvas: string;
  onCanvasChange: (canvasType: string) => void;
  onClose?: () => void;
  visibleLayers: Record<string, boolean>;
  onToggleVisibility: (layerId: string) => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  activeCanvas,
  onCanvasChange,
  onClose,
  visibleLayers,
  onToggleVisibility,
}) => {
  const canvasOptions = [
    { id: "base", name: "基础图像", icon: "image-outline" },
    { id: "drawing", name: "画布1", icon: "brush-outline" },
    { id: "content", name: "画布2", icon: "text-outline" },
    { id: "control", name: "画布3", icon: "settings-outline" },
  ];

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
        {canvasOptions.map((canvas) => {
          return (
            <TouchableOpacity
              key={canvas.id}
              style={[
                styles.layerItem,
                activeCanvas === canvas.id && styles.activeLayerItem,
              ]}
              onPress={() => onCanvasChange(canvas.id)}
            >
              <Icon
                name={canvas.icon}
                size={22}
                color={
                  activeCanvas === canvas.id
                    ? COLORS.accent
                    : COLORS.icon.inactive
                }
              />
              <Text
                style={[
                  styles.layerName,
                  activeCanvas === canvas.id && styles.activeLayerName,
                ]}
              >
                {canvas.name}
              </Text>
              <View style={styles.layerActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onToggleVisibility(canvas.id)}
                >
                  <Icon
                    name={
                      visibleLayers[canvas.id as keyof typeof visibleLayers]
                        ? "eye-outline"
                        : "eye-off-outline"
                    }
                    size={20}
                    color={
                      visibleLayers[canvas.id as keyof typeof visibleLayers]
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
