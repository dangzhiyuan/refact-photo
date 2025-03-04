import React from "react";
import { Image, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

type StickerProps = {
  id: string;
  uri: string;
  initialPosition: { x: number; y: number };
  onSelect: (id: string) => void;
  isSelected: boolean;
  onTransformUpdate?: (id: string, transform: any) => void;
};

export const Sticker = ({ 
  id, 
  uri, 
  initialPosition, 
  onSelect, 
  isSelected,
  onTransformUpdate
}: StickerProps) => {
  const translateX = useSharedValue(initialPosition.x);
  const translateY = useSharedValue(initialPosition.y);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const updateTransform = () => {
    if (onTransformUpdate) {
      onTransformUpdate(id, {
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
        rotation: rotation.value
      });
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value += event.translationX;
      translateY.value += event.translationY;
    })
    .onEnd(() => {
      if (onTransformUpdate) {
        runOnJS(updateTransform)();
      }
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(0.5, Math.min(scale.value * event.scale, 3));
    })
    .onEnd(() => {
      if (onTransformUpdate) {
        runOnJS(updateTransform)();
      }
    });

  const rotationGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value += event.rotation * 180 / Math.PI;
    })
    .onEnd(() => {
      if (onTransformUpdate) {
        runOnJS(updateTransform)();
      }
    });

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      runOnJS(onSelect)(id);
    });

  // 组合手势
  const composedGesture = Gesture.Exclusive(
    tapGesture,
    Gesture.Simultaneous(
      panGesture, 
      Gesture.Simultaneous(pinchGesture, rotationGesture)
    )
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      borderWidth: isSelected ? 1 : 0,
      borderColor: "#000",
    };
  });

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Image source={{ uri }} style={styles.image} />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    borderRadius: 2,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
}); 