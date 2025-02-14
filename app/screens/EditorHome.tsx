import React, { FC } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { CANVAS_AREA } from "../constants/layout";
import { CanvasView } from "../features/canvas/CanvasView";
import { Toolbar } from "../features/tools/Toolbar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export const EditorHome: FC = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* 编辑区域 */}
        <View style={styles.editorArea}>
          {/* 预览区域 */}
          <View style={styles.previewArea}>
            <View style={styles.canvasContainer}>
              <CanvasView />
            </View>
          </View>

          {/* 工具栏区域 */}
          <View style={styles.toolsArea}>
            <Toolbar />
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  safeArea: {
    flex: 1,
  },
  editorArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  previewArea: {
    height: CANVAS_AREA.height,
    width: "100%",
    backgroundColor: CANVAS_AREA.backgroundColor,
    borderWidth: CANVAS_AREA.borderWidth,
    borderColor: CANVAS_AREA.borderColor,
    justifyContent: "center",
    alignItems: "center",
  },
  canvasContainer: {
    width: "100%",
    height: "100%",
  },
  toolsArea: {
    paddingBottom: 20,
  },
});
