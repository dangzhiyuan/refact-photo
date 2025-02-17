import React from "react";
import { View, StyleSheet, Button } from "react-native";
import { useImagePicker } from "../canvas/hooks/useImagePicker";

export const Toolbar = () => {
  const { pickImage } = useImagePicker();

  return (
    <View style={styles.container}>
      <Button title="选择图片" onPress={pickImage} />
      {/* 其他工具按钮 */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 10,
  },
});
