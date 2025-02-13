import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { useCanvasStore } from '../../../../store/useCanvasStore';
import { Adjustments } from '../../../../types/layer';
import { MaterialIcons } from "@expo/vector-icons";

export const AdjustmentPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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
    console.log('Updating adjustments:', {
      layerId: selectedLayerId,
      type,
      value,
      newAdjustments
    });
    setAdjustments(newAdjustments);
    updateLayerAdjustments(selectedLayerId, newAdjustments);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>调整</Text>
      </View>

      <AdjustmentSlider
        label="亮度"
        value={adjustments.brightness}
        onValueChange={(value) => handleAdjustmentChange('brightness', value)}
        minimumValue={-0.5}
        maximumValue={0.5}
      />
      <AdjustmentSlider
        label="对比度"
        value={adjustments.contrast}
        onValueChange={(value) => handleAdjustmentChange('contrast', value)}
        minimumValue={-0.5}
        maximumValue={0.5}
      />
      <AdjustmentSlider
        label="饱和度"
        value={adjustments.saturation}
        onValueChange={(value) => handleAdjustmentChange('saturation', value)}
        minimumValue={0.5}
        maximumValue={1.5}
      />
      <AdjustmentSlider
        label="色温"
        value={adjustments.temperature}
        onValueChange={(value) => handleAdjustmentChange('temperature', value)}
        minimumValue={-0.5}
        maximumValue={0.5}
      />
    </View>
  );
};

interface AdjustmentSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
}

const AdjustmentSlider: React.FC<AdjustmentSliderProps> = ({
  label,
  value,
  onValueChange,
  minimumValue,
  maximumValue
}) => (
  <View style={styles.sliderContainer}>
    <Text style={styles.label}>{label}</Text>
    <Slider
      style={styles.slider}
      value={value}
      onValueChange={onValueChange}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      step={0.01}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
}); 