import React, { FC, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { PanelHeader } from '../components/PanelHeader';
import { useCanvasStore } from '../../../store/useCanvasStore';
import Slider from '@react-native-community/slider';
import { Adjustments } from '../../../types/layer';

interface AdjustmentPanelProps {
  onClose: () => void;
}

export const AdjustmentPanel: FC<AdjustmentPanelProps> = ({ onClose }) => {
  const { selectedLayerId, updateLayerAdjustments } = useCanvasStore();
  const [adjustments, setAdjustments] = useState<Adjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 1,
    temperature: 0,
  });

  const handleAdjustmentChange = (type: keyof Adjustments, value: number) => {
    if (!selectedLayerId) return;

    const newAdjustments = {
      ...adjustments,
      [type]: value,
    };
    setAdjustments(newAdjustments);
    updateLayerAdjustments(selectedLayerId, newAdjustments);
  };

  return (
    <View style={styles.container}>
      <PanelHeader title="调整" onClose={onClose} />
      <View style={styles.sliderContainer}>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>亮度</Text>
          <Slider
            style={styles.slider}
            minimumValue={-0.5}
            maximumValue={0.5}
            value={adjustments.brightness}
            onValueChange={(value) => handleAdjustmentChange('brightness', value)}
          />
        </View>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>对比度</Text>
          <Slider
            style={styles.slider}
            minimumValue={-0.5}
            maximumValue={0.5}
            value={adjustments.contrast}
            onValueChange={(value) => handleAdjustmentChange('contrast', value)}
          />
        </View>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>饱和度</Text>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={1.5}
            value={adjustments.saturation}
            onValueChange={(value) => handleAdjustmentChange('saturation', value)}
          />
        </View>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>色温</Text>
          <Slider
            style={styles.slider}
            minimumValue={-0.5}
            maximumValue={0.5}
            value={adjustments.temperature}
            onValueChange={(value) => handleAdjustmentChange('temperature', value)}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  sliderContainer: {
    padding: 16,
  },
  sliderRow: {
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
}); 