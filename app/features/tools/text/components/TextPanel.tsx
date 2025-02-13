import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { useCanvasStore } from "../../../../store/useCanvasStore";
import { ColorPicker } from "./ColorPicker";

export const TextPanel = () => {
  const { selectedLayerId, updateLayer } = useCanvasStore();
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState("#000000");

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (selectedLayerId) {
      updateLayer(selectedLayerId, { text: newText });
    }
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    if (selectedLayerId) {
      updateLayer(selectedLayerId, { fontSize: size });
    }
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (selectedLayerId) {
      updateLayer(selectedLayerId, { color: newColor });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={handleTextChange}
        placeholder="输入文字..."
        style={styles.input}
        multiline
      />
      <View style={styles.controls}>
        <Slider
          value={fontSize}
          onValueChange={handleFontSizeChange}
          minimumValue={12}
          maximumValue={72}
          step={1}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#ddd"
        />
        <ColorPicker color={color} onColorChange={handleColorChange} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  controls: {
    gap: 16,
  },
});
