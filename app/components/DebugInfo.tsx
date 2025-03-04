import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLayerStore } from "../store/useLayerStore";
import { useUserSettings } from "../store/useUserSettings";

export const DebugInfo = () => {
  const { isDebugMode, toggleDebugMode } = useUserSettings();
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const layers = useLayerStore((state) => state.layers);

  // 如果不是调试模式，仅显示调试开关
  if (!isDebugMode) {
    return (
      <TouchableOpacity style={styles.debugButton} onPress={toggleDebugMode}>
        <Text style={styles.debugButtonText}>D</Text>
      </TouchableOpacity>
    );
  }

  const selectedLayer = selectedLayerId ? layers.get(selectedLayerId) : null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={toggleDebugMode}>
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>

      <Text style={styles.title}>调试信息</Text>

      <Text style={styles.text}>图层数量: {layers.size}</Text>

      {selectedLayer ? (
        <>
          <Text style={styles.subtitle}>选中图层</Text>
          <Text style={styles.text}>
            名称: {selectedLayer.name} (ID: {selectedLayer.id.slice(0, 6)}...)
          </Text>
          <Text style={styles.text}>
            位置: X: {selectedLayer.transform.position.x.toFixed(1)}, Y:{" "}
            {selectedLayer.transform.position.y.toFixed(1)}
          </Text>
          <Text style={styles.text}>
            缩放: {selectedLayer.transform.scale.toFixed(2)}
          </Text>
          <Text style={styles.text}>
            旋转: {selectedLayer.transform.rotation.toFixed(1)}°
          </Text>
          <Text style={styles.text}>类型: {selectedLayer.type}</Text>
          <Text style={styles.text}>Z轴: {selectedLayer.zIndex}</Text>
        </>
      ) : (
        <Text style={styles.text}>未选中图层</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.85)",
    padding: 12,
    borderRadius: 8,
    minWidth: 200,
  },
  debugButton: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  debugButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 8,
  },
  subtitle: {
    color: "#88CCFF",
    fontWeight: "bold",
    fontSize: 12,
    marginTop: 6,
    marginBottom: 4,
  },
  text: {
    color: "white",
    fontSize: 11,
    marginBottom: 2,
  },
});
