import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export const TextPanel: React.FC = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>添加文字</Text>
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.fontSelector}
      >
        {["默认", "黑体", "楷体", "宋体", "圆体"].map((font) => (
          <TouchableOpacity key={font} style={styles.fontItem}>
            <Text style={styles.fontText}>{font}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.colorSelector}>
        {["#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF"].map(
          (color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorItem, { backgroundColor: color }]}
            />
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  addButton: {
    backgroundColor: "#3478F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  fontSelector: {
    marginBottom: 20,
  },
  fontItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "rgba(50, 50, 50, 0.7)",
    borderRadius: 8,
    marginRight: 10,
  },
  fontText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  colorSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  colorItem: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
});
