import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { COLORS } from "../../theme/colors";
import { useStickerManager, StickerItem } from "../../hooks/useStickerManager";
import { Icon } from "../common/Icon";
import { useEditorStore } from "../../store/editorStore";

// 示例贴纸列表
const SAMPLE_STICKERS: StickerItem[] = [
  {
    uri: "https://cdn-icons-png.flaticon.com/512/5661/5661642.png",
    width: 100,
    height: 100,
  },
  {
    uri: "https://cdn-icons-png.flaticon.com/512/3132/3132896.png",
    width: 100,
    height: 100,
  },
  {
    uri: "https://cdn-icons-png.flaticon.com/512/6831/6831000.png",
    width: 100,
    height: 100,
  },
  {
    uri: "https://cdn-icons-png.flaticon.com/512/3513/3513305.png",
    width: 100,
    height: 100,
  },
  {
    uri: "https://cdn-icons-png.flaticon.com/512/7694/7694379.png",
    width: 100,
    height: 100,
  },
  {
    uri: "https://cdn-icons-png.flaticon.com/512/6495/6495019.png",
    width: 100,
    height: 100,
  },
];

// 创建上下文来访问 setActiveCanvas 函数
interface EditorContextProps {
  setActiveCanvas: (id: string) => void;
}

interface StickerPanelProps {
  onClose?: () => void;
  setActiveCanvas?: (id: string) => void; // 接收 setActiveCanvas 作为 prop
}

export const StickerPanel: React.FC<StickerPanelProps> = ({
  onClose,
  setActiveCanvas,
}) => {
  const { addSticker } = useStickerManager();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<number | null>(null);

  const handleAddSticker = async (sticker: StickerItem, index: number) => {
    setSelectedSticker(index);
    setIsLoading(true);

    try {
      // 添加贴纸到画布
      const layerId = await addSticker(sticker);
      console.log("添加贴纸成功，ID:", layerId);

      // 重置加载状态
      setIsLoading(false);

      // 如果提供了 setActiveCanvas 函数，自动选中新添加的贴纸图层
      if (setActiveCanvas) {
        setActiveCanvas(layerId);
      }
    } catch (error) {
      console.error("添加贴纸失败:", error);
      Alert.alert("添加贴纸失败", "请稍后再试或选择其他贴纸。", [
        { text: "确定" },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>贴纸</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close-outline" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>正在添加贴纸...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.stickerGrid}
        >
          {SAMPLE_STICKERS.map((sticker, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.stickerItem,
                selectedSticker === index && styles.selectedStickerItem,
              ]}
              onPress={() => handleAddSticker(sticker, index)}
              disabled={isLoading}
            >
              <Image
                source={{ uri: sticker.uri }}
                style={styles.stickerImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
  closeButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  stickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 4,
  },
  stickerItem: {
    width: "25%", // 更小的贴纸，一行4个
    aspectRatio: 1,
    padding: 6,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 8,
  },
  selectedStickerItem: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + "10",
  },
  stickerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: COLORS.canvasBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
});
