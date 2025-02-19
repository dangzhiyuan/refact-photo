import React, { useCallback, useRef, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { debounce } from "lodash";
import { colors } from "../../../../constants/colors";

interface IntensitySliderProps {
  value: number;
  displayValue: number;
  onChange: (value: number) => void;
  onComplete: (value: number) => void;
}

export const IntensitySlider: React.FC<IntensitySliderProps> = ({
  value,
  displayValue,
  onChange,
  onComplete,
}) => {
  const animatedIntensity = useSharedValue(value);

  // 使用 useRef 保存 debounced 函数
  const debouncedComplete = useRef(
    debounce((value: number) => onComplete(value), 300) // 减少延迟到 300ms
  ).current;

  // 滑动时更新显示值
  const handleValueChange = useCallback(
    (newValue: number) => {
      animatedIntensity.value = withSpring(newValue, {
        mass: 0.5,
        stiffness: 100,
        damping: 10,
      });
      onChange(newValue);
    },
    [animatedIntensity, onChange]
  );

  // 滑动结束时应用滤镜
  const handleSlidingComplete = useCallback(
    (finalValue: number) => {
      debouncedComplete(finalValue);
    },
    [debouncedComplete]
  );

  // 清理 debounced 函数
  useEffect(() => {
    return () => {
      debouncedComplete.cancel();
    };
  }, [debouncedComplete]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>强度</Text>
        <Text style={styles.value}>{Math.round(displayValue * 100)}%</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={value}
        onValueChange={handleValueChange}
        onSlidingComplete={handleSlidingComplete}
        step={0.01}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.whiteBk,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: colors.text,
  },
  value: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  slider: {
    width: "100%",
  },
});
