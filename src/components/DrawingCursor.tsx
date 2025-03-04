import React from "react";
import { StyleSheet } from "react-native";
import Animated, { 
  useAnimatedStyle,
  SharedValue
} from "react-native-reanimated";

type DrawingCursorProps = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  visible: SharedValue<boolean>;
  color: string;
  size: SharedValue<number>;
};

export const DrawingCursor = ({ x, y, visible, color, size }: DrawingCursorProps) => {
  // 创建光标动画样式 - 正确使用共享值
  const cursorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: x.value - size.value / 2 },
        { translateY: y.value - size.value / 2 },
      ],
      opacity: visible.value ? 1 : 0,
      width: size.value,
      height: size.value,
      borderRadius: size.value / 2,
      borderWidth: 1,
      borderColor: '#000000',
      backgroundColor: color,
    };
  });

  return (
    <Animated.View style={[styles.cursor, cursorStyle]} />
  );
};

const styles = StyleSheet.create({
  cursor: {
    position: 'absolute',
    pointerEvents: 'none',
  },
}); 