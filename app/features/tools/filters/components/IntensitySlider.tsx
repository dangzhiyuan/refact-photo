import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export const IntensitySlider: React.FC<IntensitySliderProps> = ({
  value,
  onChange,
}) => {
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
        minimumTrackTintColor="#007AFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  slider: {
    width: "100%",
  },
});
