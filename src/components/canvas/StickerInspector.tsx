import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Icon } from "../common/Icon";
import { COLORS } from "../../theme/colors";
import { useCanvasStore } from "../../store/canvasStore";
import { LayerType, StickerLayer } from "../../core/types/canvas";

interface StickerInspectorProps {
  selectedLayerId: string | null;
  onDelete?: (id: string) => void;
}

export const StickerInspector: React.FC<StickerInspectorProps> = ({
  selectedLayerId,
  onDelete,
}) => {
  // 如果没有选中的图层，或者不是贴纸图层，返回 null
  if (!selectedLayerId) return null;

  const layer = useCanvasStore((state) =>
    state.layers[selectedLayerId] &&
    state.layers[selectedLayerId].type === LayerType.STICKER
      ? (state.layers[selectedLayerId] as StickerLayer)
      : null
  );

  if (!layer) return null;

  const handleDelete = () => {
    Alert.alert("删除贴纸", "确定要删除这个贴纸吗？", [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: () => onDelete && onDelete(selectedLayerId),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>贴纸控制</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleDelete}>
          <Icon name="trash-outline" size={24} color={COLORS.accent} />
          <Text style={styles.buttonText}>删除</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Icon
            name="color-wand-outline"
            size={24}
            color={COLORS.text.primary}
          />
          <Text style={styles.buttonText}>效果</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Icon name="copy-outline" size={24} color={COLORS.text.primary} />
          <Text style={styles.buttonText}>复制</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Icon name="layers-outline" size={24} color={COLORS.text.primary} />
          <Text style={styles.buttonText}>图层</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.panelBackground,
    borderRadius: 12,
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.text.secondary,
  },
});
