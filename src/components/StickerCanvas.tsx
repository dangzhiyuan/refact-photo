import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useCanvasManager } from "../context/CanvasManagerContext";
import { useStickerStore } from "../store/stickerStore";
import { Sticker } from "./Sticker";

export const StickerCanvas = () => {
  const { registerCanvas } = useCanvasManager();
  const { stickers, selectedStickerId, selectSticker, updateStickerPosition } = useStickerStore();
  
  // 注册Canvas
  useEffect(() => {
    registerCanvas("sticker", { type: "sticker" });
  }, [registerCanvas]);
  
  // 处理贴纸选择
  const handleSelectSticker = (id: string) => {
    selectSticker(id);
  };
  
  // 处理贴纸变换更新
  const handleTransformUpdate = (id: string, transform: any) => {
    updateStickerPosition(id, transform);
  };
  
  return (
    <View style={styles.container}>
      {stickers.map((sticker) => (
        <Sticker
          key={sticker.id}
          id={sticker.id}
          uri={sticker.uri}
          initialPosition={sticker.position}
          isSelected={selectedStickerId === sticker.id}
          onSelect={handleSelectSticker}
          onTransformUpdate={handleTransformUpdate}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    // 确保贴纸Canvas在照片Canvas之上
    zIndex: 1,
  },
}); 