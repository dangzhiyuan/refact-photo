import React, { FC } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface FilterButtonProps {
  title: string;
  onPress: () => void;
}

export const FilterButton: FC<FilterButtonProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  text: {
    fontSize: 14,
  },
});
