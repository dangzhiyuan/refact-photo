import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export const IntensitySlider = ({ value, onChange }: IntensitySliderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>强度: {Math.round(value * 100)}%</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={value}
        onValueChange={onChange}
        step={0.01}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  slider: {
    width: "100%",
  },
});
