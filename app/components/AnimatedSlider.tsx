import React, { FC } from "react";
import { StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { useSharedValue, useAnimatedProps } from "react-native-reanimated";

interface AnimatedSliderProps {
  minimumValue: number;
  maximumValue: number;
  step?: number;
  value: number;
  onValueChange: (value: number) => void;
  style?: any;
}

export const AnimatedSlider: FC<AnimatedSliderProps> = ({
  minimumValue,
  maximumValue,
  step = 0.1,
  value,
  onValueChange,
  style,
}) => {
  const sliderValue = useSharedValue(value);

  const animatedProps = useAnimatedProps(() => {
    return {
      value: sliderValue.value,
    };
  });

  return (
    <Slider
      style={[styles.slider, style]}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      step={step}
      animatedProps={animatedProps}
      onValueChange={(value) => {
        sliderValue.value = value;
        onValueChange(value);
      }}
    />
  );
};

const styles = StyleSheet.create({
  slider: {
    width: "100%",
    height: 40,
  },
});
