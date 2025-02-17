import React, { FC } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { FilterPanel } from './FilterPanel';
import { AdjustmentPanel } from './AdjustmentPanel';
import { TextPanel } from './TextPanel';

type ToolType = 'filter' | 'adjustment' | 'text' | null;

interface EditorPanelsProps {
  activeTool: ToolType;
  onClose: () => void;
}

export const EditorPanels: FC<EditorPanelsProps> = ({ activeTool, onClose }) => {
  const { height: windowHeight } = useWindowDimensions();
  const panelHeight = windowHeight * 0.45; // 45% 的屏幕高度

  return (
    <View style={[styles.container, { height: panelHeight }]}>
      <View style={styles.panelContent}>
        {activeTool === 'filter' && <FilterPanel onClose={onClose} />}
        {activeTool === 'adjustment' && <AdjustmentPanel onClose={onClose} />}
        {activeTool === 'text' && <TextPanel onClose={onClose} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
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