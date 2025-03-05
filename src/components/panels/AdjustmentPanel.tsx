import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useEditorStore } from "../../store/editorStore";

export const AdjustmentPanel: React.FC = () => {
  const { adjustments, updateAdjustments } = useEditorStore();

  const adjustmentOptions = [
    {
      id: "brightness",
      name: "亮度",
      min: -100,
      max: 100,
      value: adjustments.brightness,
    },
    {
      id: "contrast",
      name: "对比度",
      min: -100,
      max: 100,
      value: adjustments.contrast,
    },
    {
      id: "saturation",
      name: "饱和度",
      min: -100,
      max: 100,
      value: adjustments.saturation,
    },
    {
      id: "temperature",
      name: "色温",
      min: -100,
      max: 100,
      value: adjustments.temperature,
    },
    {
      id: "vignette",
      name: "暗角",
      min: 0,
      max: 100,
      value: adjustments.vignette,
    },
  ];

  const handleSliderChange = (id: string, value: number) => {
    updateAdjustments({ [id]: value });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {adjustmentOptions.map((option) => (
          <View key={option.id} style={styles.adjustmentRow}>
            <Text style={styles.adjustmentLabel}>{option.name}</Text>
            <Slider
              style={styles.slider}
              minimumValue={option.min}
              maximumValue={option.max}
              value={option.value}
              minimumTrackTintColor="#FFC0CB" // 淡粉色
              maximumTrackTintColor="#444"
              thumbTintColor="#FFF"
              onValueChange={(value) => handleSliderChange(option.id, value)}
            />
            <Text style={styles.adjustmentValue}>
              {Math.round(option.value)}
            </Text>
          </View>
        ))}

        <TouchableOpacity style={styles.resetButton}>
          <Text style={styles.resetText}>重置</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: 300,
  },
  adjustmentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  adjustmentLabel: {
    color: "#FFFFFF",
    width: 80,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  adjustmentValue: {
    color: "#FFFFFF",
    width: 40,
    textAlign: "right",
  },
  resetButton: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: "rgba(100, 100, 100, 0.5)",
    borderRadius: 20,
    marginTop: 10,
  },
  resetText: {
    color: "#FFFFFF",
  },
});
