import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useCanvasStore, CanvasType } from "../store/canvasStore";

export const CanvasSelector: React.FC = () => {
  const activeCanvas = useCanvasStore((state) => state.activeCanvas);
  const setActiveCanvas = useCanvasStore((state) => state.setActiveCanvas);

  const canvasOptions: { id: CanvasType; label: string }[] = [
    { id: "base", label: "基础图像" },
    { id: "drawing", label: "绘图" },
    { id: "content", label: "内容" },
    { id: "control", label: "控制" },
  ];

  return (
    <View style={styles.container}>
      {canvasOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.button,
            activeCanvas === option.id && styles.activeButton,
          ]}
          onPress={() => setActiveCanvas(option.id)}
        >
          <Text
            style={[
              styles.buttonText,
              activeCanvas === option.id && styles.activeButtonText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 20,
    marginHorizontal: 8,
    minWidth: 80,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#1E90FF",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  activeButtonText: {
    fontWeight: "bold",
  },
});
