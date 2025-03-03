import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

export const TestGesture = () => {
  const position = useSharedValue({ x: 100, y: 100 });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs((prev) => [msg, ...prev.slice(0, 5)]);
  };

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      addLog(`Pan start at ${e.x}, ${e.y}`);
    })
    .onUpdate((e) => {
      addLog(`Pan update dx=${e.translationX}, dy=${e.translationY}`);
      position.value = {
        x: position.value.x + e.translationX,
        y: position.value.y + e.translationY,
      };
    })
    .onEnd(() => {
      addLog("Pan ended");
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: position.value.x },
      { translateY: position.value.y },
    ],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.box, animatedStyle]} />
      </GestureDetector>

      <View style={styles.logContainer}>
        {logs.map((log, i) => (
          <Text key={i} style={styles.logText}>
            {log}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: "red",
    position: "absolute",
  },
  logContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 5,
  },
  logText: {
    color: "white",
    marginVertical: 2,
  },
});
