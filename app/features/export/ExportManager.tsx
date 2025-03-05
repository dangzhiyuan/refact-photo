import React, { useRef } from "react";
import { TouchableOpacity, Text, Alert, StyleSheet } from "react-native";
import * as MediaLibrary from "expo-media-library";
import ViewShot from "react-native-view-shot";
import Icon from "react-native-vector-icons/MaterialIcons";

export const ExportManager = ({ canvasRef }) => {
  // 保存图片到相册
  const saveToGallery = async () => {
    try {
      // 请求相册访问权限
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("权限被拒绝", "需要相册权限来保存图片");
        return;
      }

      // 截图
      const uri = await canvasRef.current.capture();
      console.log("截图完成：", uri);

      // 保存到相册
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Photo Editor", asset, false);

      Alert.alert("保存成功", "图片已保存到相册");
    } catch (error) {
      console.error("保存失败:", error);
      Alert.alert("保存失败", error.message);
    }
  };

  return (
    <TouchableOpacity style={styles.saveButton} onPress={saveToGallery}>
      <Icon name="save" size={24} color="#fff" />
      <Text style={styles.saveText}>保存</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  saveText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
});
