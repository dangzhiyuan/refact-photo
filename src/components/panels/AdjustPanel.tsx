import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const AdjustPanel = () => {
  return (
    <View style={styles.container}>
      <Text>调整面板</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
}); 