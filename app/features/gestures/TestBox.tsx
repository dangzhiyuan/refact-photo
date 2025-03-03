import React from "react";
import { View, Text } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

export const TestBox = () => {
  const offsetX = useSharedValue(50);
  const offsetY = useSharedValue(50);

  // 简单日志记录点击和拖动
  const tapGesture = Gesture.Tap().onStart(() => {
    console.log("TEST BOX TAPPED!");
  });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      console.log("TEST BOX PAN STARTED");
    })
    .onChange((e) => {
      console.log(`TEST BOX MOVED: dx=${e.changeX}, dy=${e.changeY}`);
      offsetX.value += e.changeX;
      offsetY.value += e.changeY;
    })
    .onEnd(() => {
      console.log("TEST BOX PAN ENDED");
    });

  const gesture = Gesture.Race(tapGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
    };
  });

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 2000,
        pointerEvents: "box-none",
      }}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 150,
              height: 150,
              backgroundColor: "rgba(0,255,0,0.5)",
              borderWidth: 2,
              borderColor: "white",
              justifyContent: "center",
              alignItems: "center",
            },
            animatedStyle,
          ]}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>拖我</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
