import React, { useCallback, useState, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { debounce } from "lodash";

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

  // 使用 useRef 保存 debounced 函数，避免重新创建
  const debouncedComplete = useRef(
    debounce((value: number) => {
      onComplete(value);
    }, 500) // 500ms 延迟
  ).current;

  // 滑动时更新显示值
  const handleValueChange = useCallback(
    (newValue: number) => {
      animatedIntensity.value = withSpring(newValue, {
        mass: 0.5,
        stiffness: 100,
        damping: 10,
      });
      onChange(newValue); // 实时更新UI
    },
    [onChange]
  );

  // 滑动结束时延迟应用滤镜
  const handleSlidingComplete = useCallback(
    (finalValue: number) => {
      debouncedComplete(finalValue);
    },
    [debouncedComplete]
  );

  // 组件卸载时取消待处理的 debounced 调用
  React.useEffect(() => {
    return () => {
      debouncedComplete.cancel();
    };
  }, [debouncedComplete]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>强度: {Math.round(displayValue * 100)}%</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={value}
        onValueChange={handleValueChange}
        onSlidingComplete={handleSlidingComplete}
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
