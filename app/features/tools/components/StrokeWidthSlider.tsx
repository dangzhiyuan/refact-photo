import React, { FC } from "react";
import { View, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

interface StrokeWidthSliderProps {
  onValueChange: (width: number) => void;
}

export const StrokeWidthSlider: FC<StrokeWidthSliderProps> = ({
  onValueChange,
}) => {
  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={20}
        step={1}
        value={3}
        onValueChange={onValueChange}
        minimumTrackTintColor="#000000"
        maximumTrackTintColor="#cccccc"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  slider: {
    width: "100%",
    height: 40,
  },
});
