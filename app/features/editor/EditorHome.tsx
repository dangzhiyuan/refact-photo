import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { CanvasView } from "../canvas/CanvasView";
import { useImageManager } from "../../hooks/canvas/useImageManager";
import { limitCanvasSize } from "../../utils/canvasUtils";

export const EditorHome = () => {
  const { isLoading, loadImage } = useImageManager();

  const handleAddImage = async () => {
    // 使用修改后的loadImage函数
    const newLayer = await loadImage();

    // 查看结果，确认函数是否被正确调用
    console.log("加载的图片:", newLayer);
  };

  return (
    <View style={styles.container}>
      <CanvasView />

      {/* 确保有图片加载按钮 */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleAddImage}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "加载中..." : "添加图片"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: "row",
    padding: 10,
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
  },
});
