import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StyleProp, TextStyle } from "react-native";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = "black",
  style,
}) => {
  return (
    <Ionicons
      name={name as IoniconsName}
      size={size}
      color={color}
      style={style}
    />
  );
};
