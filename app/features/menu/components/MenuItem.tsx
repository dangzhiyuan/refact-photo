import React, { FC } from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { MenuItemProps } from "../types/menu";
import { MENU_LAYOUT } from "../../../constants/layout";
import { colors } from "../../../constants/colors";

export const MenuItem: FC<MenuItemProps> = ({
  id,
  label,
  icon,
  disabled = false,
  onClick,
  onSelect,
}) => {
  const handlePress = () => {
    if (disabled) return;
    onClick?.();
    onSelect?.(id);
  };

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={handlePress}
      disabled={disabled}
    >
      {icon && (
        <View style={styles.iconContainer}>
          {/* 这里可以根据需要渲染图标 */}
        </View>
      )}
      <Text style={[styles.label, disabled && styles.disabledText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: MENU_LAYOUT.itemHeight,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MENU_LAYOUT.itemPadding,
    backgroundColor: colors.whiteBk,
  },
  iconContainer: {
    width: MENU_LAYOUT.iconSize,
    height: MENU_LAYOUT.iconSize,
    marginRight: MENU_LAYOUT.itemPadding,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: colors.axisLabel,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.axisText,
  },
});
