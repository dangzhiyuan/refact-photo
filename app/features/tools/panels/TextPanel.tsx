import React, { FC } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { PanelHeader } from '../components/PanelHeader';
import { useCanvasStore } from '../../../store/useCanvasStore';
import { createTextLayer } from '../../../store/useCanvasStore';

interface TextPanelProps {
  onClose: () => void;
}

export const TextPanel: FC<TextPanelProps> = ({ onClose }) => {
  const { addLayer } = useCanvasStore();

  const handleAddText = () => {
    const textLayer = createTextLayer();
    addLayer(textLayer);
  };

  return (
    <View style={styles.container}>
      <PanelHeader title="文字" onClose={onClose} />
      <TouchableOpacity style={styles.addButton} onPress={handleAddText}>
        <Text style={styles.addButtonText}>添加文字</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  addButton: {
    margin: 16,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 