import React, { FC } from "react";
import { View, StyleSheet } from "react-native";

interface CanvasTouchHandlerProps {
  children: React.ReactNode;
  onTouchStart?: (info: { x: number; y: number }) => void;
}

export const CanvasTouchHandler: FC<CanvasTouchHandlerProps> = ({
  children,
  onTouchStart,
}) => {
  // ... 保持原有实现
};
