import React from "react";
import { Text, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

export const SimpleDragTest = () => {
  const translateX = useSharedValue(100);
  const translateY = useSharedValue(100);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      console.log("TEST DRAG STARTED!");
    })
    .onChange((e) => {
      console.log("DRAG MOVE:", e.changeX, e.changeY);
      translateX.value += e.changeX;
      translateY.value += e.changeY;
    })
    .onEnd(() => {
      console.log("DRAG ENDED");
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    position: "absolute",
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.box, animatedStyle]}>
        <Text style={styles.text}>拖动测试</Text>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  box: {
    width: 120,
    height: 120,
    backgroundColor: "rgba(255,0,0,0.5)",
    borderWidth: 3,
    borderColor: "white",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
