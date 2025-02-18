import React, { FC } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../../../constants/colors";

interface ToolButtonProps {
  icon: string;
  label: string;
  isActive: boolean;
  disabled?: boolean;
  onPress: () => void;
  children?: React.ReactNode;
}

export const ToolButton: FC<ToolButtonProps> = ({
  icon,
  label,
  isActive,
  disabled,
  onPress,
  children,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onPress}
    >
      <Text style={styles.label}>{label}</Text>
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeContainer: {
    backgroundColor: colors.primaryLight,
  },
  label: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
  },
});
