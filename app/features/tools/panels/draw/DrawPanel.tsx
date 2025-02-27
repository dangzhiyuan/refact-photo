import React, { FC } from "react";
import { View, StyleSheet } from "react-native";
import { PanelHeader } from "../components/PanelHeader";

interface DrawPanelProps {
  onClose: () => void;
}

export const DrawPanel: FC<DrawPanelProps> = ({ onClose }) => {
  return (
    <View style={styles.container}>
      <PanelHeader title="涂鸦" onClose={onClose} />
      <View style={styles.content}>
        {/* 这里添加涂鸦工具的控制项，如：
          - 画笔颜色选择
          - 画笔大小调整
          - 撤销/重做按钮
        */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
  },
});
