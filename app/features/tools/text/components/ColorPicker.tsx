import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";

const COLORS = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
];

interface ColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onColorChange,
}) => {
  return (
    <View style={styles.container}>
      {COLORS.map((c) => (
        <TouchableOpacity
          key={c}
          style={[
            styles.colorButton,
            { backgroundColor: c },
            c === color && styles.selected,
          ]}
          onPress={() => onColorChange(c)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selected: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
});
