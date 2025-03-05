import React from "react";
import { View, StyleSheet } from "react-native";

interface StickerCanvasProps {
  width: number;
  height: number;
}

export const StickerCanvas: React.FC<StickerCanvasProps> = ({
  width,
  height,
}) => {
  // 暂时返回空视图，稍后实现
  return (
    <View style={[styles.canvas, { width, height }]}>
      {/* 贴纸功能暂时未实现 */}
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    position: "absolute",
  },
});
