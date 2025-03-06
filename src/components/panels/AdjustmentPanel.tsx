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
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../theme/colors";

interface AdjustmentPanelProps {
  onClose?: () => void;
}

export const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({
  onClose,
}) => {
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
      <View style={styles.header}>
        <Text style={styles.title}>调整</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons
              name="close-outline"
              size={24}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {adjustmentOptions.map((option) => (
          <View key={option.id} style={styles.adjustmentRow}>
            <Text style={styles.adjustmentLabel}>{option.name}</Text>
            <Slider
              style={styles.slider}
              minimumValue={option.min}
              maximumValue={option.max}
              value={option.value}
              minimumTrackTintColor={COLORS.accent}
              maximumTrackTintColor={COLORS.border}
              thumbTintColor={COLORS.accent}
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
    flex: 1,
    backgroundColor: COLORS.panelBackground,
    borderRadius: 12,
    margin: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
  },
  adjustmentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  adjustmentLabel: {
    color: COLORS.text.secondary,
    width: 80,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  adjustmentValue: {
    color: COLORS.text.primary,
    width: 40,
    textAlign: "right",
  },
  resetButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  resetText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  closeButton: {
    padding: 4,
  },
});
