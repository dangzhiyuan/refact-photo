import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import { Canvas, Image, Group, useImage } from "@shopify/react-native-skia";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { useEditorStore } from "../../store/editorStore";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const DEFAULT_IMAGE_URL =
  "https://img2.baidu.com/it/u=3768614006,1074423183&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=856";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const DrawingCanvas: React.FC<{
  isActive?: boolean;
  onActivate?: () => void;
  disableGestures?: boolean;
}> = ({ isActive = false, onActivate = () => {}, disableGestures }) => {
  const baseImageUri = useEditorStore((state) => state.baseImageUri);
  const userImage = useImage(baseImageUri);
  const defaultImage = useImage(DEFAULT_IMAGE_URL);
  const image = userImage || defaultImage;

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const offset = useSharedValue({ x: 0, y: 0 });
  const start = useSharedValue({ x: 0, y: 0 });

  const panGesture = Gesture.Pan()
    .enabled(isActive && !disableGestures)
    .averageTouches(true)
    .onUpdate((e) => {
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    })
    .onEnd(() => {
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
    })
    .runOnJS(true);

  const tapGesture = Gesture.Tap().onEnd(() => {
    console.log("DrawingCanvas 被点击并激活");
    onActivate();
  });

  const composed = Gesture.Race(panGesture, tapGesture);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value.x },
      { translateY: offset.value.y },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[
          styles.container,
          animatedStyles,
          isActive && styles.activeContainer,
        ]}
      >
        <Canvas style={styles.canvas}>
          <Image
            image={image}
            fit="contain"
            x={0}
            y={0}
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
          />
          <Group>{/* 绘画内容 */}</Group>
        </Canvas>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  canvas: {
    flex: 1,
  },
  activeContainer: {
    borderWidth: 2,
    borderColor: "#1E90FF",
  },
});
