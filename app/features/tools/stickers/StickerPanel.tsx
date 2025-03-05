import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import { useStickerStore } from "../../../store/stickerStore";
import { useEditorStore } from "../../../store/editorStore";

export const StickerPanel: React.FC = () => {
  const { addSticker } = useStickerStore();
  const { addLayer } = useEditorStore();

  // 临时移除贴纸列表，使用简单文本代替
  const handleAddDummySticker = () => {
    // 添加一个虚拟贴纸
    console.log("添加贴纸功能暂未实现");
    // 这里我们不再调用 addSticker，因为它需要真实的图片路径
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.stickersContainer}>
          <TouchableOpacity
            style={styles.stickerItem}
            onPress={handleAddDummySticker}
          >
            <Text style={styles.stickerText}>贴纸1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stickerItem}
            onPress={handleAddDummySticker}
          >
            <Text style={styles.stickerText}>贴纸2</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stickerItem}
            onPress={handleAddDummySticker}
          >
            <Text style={styles.stickerText}>贴纸3</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  stickersContainer: {
    flexDirection: "row",
  },
  stickerItem: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },
  stickerText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
