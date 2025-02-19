import React, { FC } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { FilterPanel } from "./filter/FilterPanel";
import { AdjustmentPanel } from "./adjustment/AdjustmentPanel";
import { TextPanel } from "./text/TextPanel";
import { LayerPanel } from "../../layers/LayerPanel";
import { ToolType } from "../../../types/tools";

interface EditorPanelsProps {
  activeTool: ToolType;
  onClose: () => void;
}

export const EditorPanels: FC<EditorPanelsProps> = ({
  activeTool,
  onClose,
}) => {
  const { height: windowHeight } = useWindowDimensions();
  const panelHeight = windowHeight * 0.45; // 45% 的屏幕高度

  const renderPanel = () => {
    switch (activeTool) {
      case "layers":
        return <LayerPanel />;
      case "filter":
        return <FilterPanel onClose={onClose} />;
      case "adjustment":
        return <AdjustmentPanel onClose={onClose} />;
      case "text":
        return <TextPanel onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { height: panelHeight * 0.85 }]}>
      <View style={styles.panelContent}>{renderPanel()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  panelContent: {
    flex: 1,
  },
});
