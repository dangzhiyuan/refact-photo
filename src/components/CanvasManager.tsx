import React from "react";
import { View, StyleSheet } from "react-native";
import { BaseCanvas } from "./canvas/BaseCanvas";
import { DrawingCanvas } from "../canvas/DrawingCanvas";
import { ContentCanvas } from "./canvas/ContentCanvas";
import { ControlCanvas } from "./canvas/ControlCanvas";
import { SimpleDragTest } from "../canvas/SimpleDragTest";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export const CanvasManager: React.FC = () => {
  return (
    <>
      {/* 测试拖动 */}
      <SimpleDragTest />

      {/* 基础层: 显示背景图像 */}
      <View style={[StyleSheet.absoluteFill, { zIndex: 5 }]}>
        <BaseCanvas />
      </View>

      {/* 其他Canvas层 */}
      <View style={[StyleSheet.absoluteFill, { zIndex: 10 }]}>
        <DrawingCanvas />
      </View>

      <View
        style={[StyleSheet.absoluteFill, { zIndex: 15 }]}
        pointerEvents="box-none"
      >
        {/* <ContentCanvas /> */}
      </View>

      <View
        style={[StyleSheet.absoluteFill, { zIndex: 20 }]}
        pointerEvents="box-none"
      >
        {/* <ControlCanvas /> */}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
});
