import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Icon } from "./Icon";
import { COLORS } from "../../theme/colors";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

interface SelectionFrameProps {
  position: SharedValue<{ x: number; y: number }>;
  width: number | SharedValue<number>;
  height: number | SharedValue<number>;
  rotation?: SharedValue<number>;
  scale?: SharedValue<number>;
  onRotate?: () => void;
  onResize?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const SelectionFrame: React.FC<SelectionFrameProps> = ({
  position,
  width,
  height,
  rotation = { value: 0 } as SharedValue<number>,
  scale = { value: 1 } as SharedValue<number>,
  onRotate,
  onResize,
  onDelete,
  onEdit,
}) => {
  // 控制手柄大小
  const handleSize = 30;

  // 创建动画样式，确保选择框跟随贴纸移动和旋转
  const frameStyle = useAnimatedStyle(() => {
    const w = typeof width === "number" ? width : width.value;
    const h = typeof height === "number" ? height : height.value;

    // 使用与贴纸完全相同的变换方式，确保完美对齐
    return {
      position: "absolute",
      width: w,
      height: h,
      transform: [
        { translateX: position.value.x },
        { translateY: position.value.y },
        { scale: scale.value },
        { rotate: `${rotation.value}rad` },
      ],
      borderWidth: 2,
      borderColor: COLORS.accent,
      borderStyle: "dashed",
      borderRadius: 4,
      zIndex: 999,
      pointerEvents: "none", // 允许点击穿透到下面的图层
    };
  });

  // 修复控制点的旋转角度计算
  const getHandleStyle = (angle: number = 0) => {
    return useAnimatedStyle(() => ({
      transform: [
        // 确保旋转值是一个有效的数字
        { rotate: `${-rotation.value + angle}rad` },
      ],
    }));
  };

  const topLeftStyle = getHandleStyle();
  const topRightStyle = getHandleStyle();
  const bottomLeftStyle = getHandleStyle();
  const bottomRightStyle = getHandleStyle();

  return (
    <Animated.View style={frameStyle}>
      {/* 左上角 - 删除按钮 */}
      <Animated.View style={[styles.handle, styles.topLeft, topLeftStyle]}>
        <TouchableOpacity onPress={onDelete}>
          <Icon name="close-circle" size={handleSize} color={COLORS.accent} />
        </TouchableOpacity>
      </Animated.View>

      {/* 右上角 - 旋转按钮 */}
      <Animated.View style={[styles.handle, styles.topRight, topRightStyle]}>
        <TouchableOpacity onPress={onRotate}>
          <Icon name="sync" size={handleSize} color={COLORS.accent} />
        </TouchableOpacity>
      </Animated.View>

      {/* 右下角 - 缩放按钮 */}
      <Animated.View
        style={[styles.handle, styles.bottomRight, bottomRightStyle]}
      >
        <TouchableOpacity onPress={onResize}>
          <Icon name="resize" size={handleSize} color={COLORS.accent} />
        </TouchableOpacity>
      </Animated.View>

      {/* 左下角 - 编辑按钮 */}
      <Animated.View
        style={[styles.handle, styles.bottomLeft, bottomLeftStyle]}
      >
        <TouchableOpacity onPress={onEdit}>
          <Icon name="create" size={handleSize} color={COLORS.accent} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  handle: {
    position: "absolute",
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    pointerEvents: "auto", // 确保手柄可以接收触摸事件
  },
  topLeft: {
    left: -16,
    top: -16,
  },
  topRight: {
    right: -16,
    top: -16,
  },
  bottomRight: {
    right: -16,
    bottom: -16,
  },
  bottomLeft: {
    left: -16,
    bottom: -16,
  },
});
