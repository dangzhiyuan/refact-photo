import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useDrawModeStore } from "../../../store/useDrawModeStore";

export const DrawModeControls: FC = () => {
  const {
    isDrawMode,
    setDrawMode,
    activeColor,
    setActiveColor,
    strokeWidth,
    setStrokeWidth,
  } = useDrawModeStore();

  const colors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00"];
  const widths = [1, 3, 5, 8];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.modeButton, isDrawMode && styles.activeButton]}
        onPress={() => setDrawMode(!isDrawMode)}
      >
        <Text style={styles.buttonText}>
          {isDrawMode ? "Exit Draw Mode" : "Enter Draw Mode"}
        </Text>
      </TouchableOpacity>

      {isDrawMode && (
        <View style={styles.controls}>
          <View style={styles.colorPicker}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  color === activeColor && styles.selectedColor,
                ]}
                onPress={() => setActiveColor(color)}
              />
            ))}
          </View>

          <View style={styles.widthPicker}>
            {widths.map((width) => (
              <TouchableOpacity
                key={width}
                style={[
                  styles.widthOption,
                  width === strokeWidth && styles.selectedWidth,
                ]}
                onPress={() => setStrokeWidth(width)}
              >
                <View
                  style={[
                    styles.widthPreview,
                    { height: width, backgroundColor: activeColor },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // ...样式定义...
});
