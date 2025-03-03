import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { useRealTimeStore } from "../../store/useRealTimeStore";

export const LayerPanel = () => {
  // 现有代码...

  const { isRealTimeMode, toggleRealTimeMode } = useRealTimeStore();

  return (
    <View style={styles.container}>
      {/* 现有图层列表... */}

      {/* 实时模式开关 */}
      <View style={styles.realTimeModeContainer}>
        <Text style={styles.realTimeModeText}>实时编辑模式</Text>
        <Switch
          value={isRealTimeMode}
          onValueChange={toggleRealTimeMode}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isRealTimeMode ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      {/* 可以添加一个小提示 */}
      <Text style={styles.hintText}>
        {isRealTimeMode
          ? "实时模式：拖动时图像会立即更新，可能影响性能"
          : "普通模式：拖动时显示预览，释放后更新图像"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // ...
  },
  realTimeModeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    marginTop: 10,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 5,
  },
  realTimeModeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  hintText: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    marginHorizontal: 10,
    fontStyle: "italic",
  },
});
