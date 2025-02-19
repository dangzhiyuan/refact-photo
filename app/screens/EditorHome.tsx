import React, { FC } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { CANVAS_AREA } from "../constants/layout";
import { CanvasView } from "../features/canvas/CanvasView";
import { Toolbar } from "../features/tools/Toolbar";
import { colors } from "../constants/colors";

export const EditorHome: FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.editorArea}>
        <View style={styles.previewArea}>
          <View style={styles.canvasContainer}>
            <CanvasView />
          </View>
        </View>
        <View style={styles.toolsArea}>
          <Toolbar />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  editorArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  previewArea: {
    height: CANVAS_AREA.height,
    width: "100%",
    backgroundColor: colors.whiteBk,
    borderWidth: 1,
    borderColor: colors.border,
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
