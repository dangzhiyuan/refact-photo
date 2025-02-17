import React, { FC, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { SubMenuProps } from "../types/menu";
import { MENU_LAYOUT } from "../../../constants/layout";
import { colors } from "../../../constants/colors";
import { MenuItem } from "./MenuItem";

export const SubMenu: FC<SubMenuProps> = ({
  label,
  icon,
  children,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const height = useSharedValue(0);

  // 计算子菜单总高度
  const contentHeight = children.length * MENU_LAYOUT.itemHeight;

  const animatedStyles = useAnimatedStyle(() => ({
    height: height.value,
    opacity: height.value === 0 ? 0 : 1,
  }));

  const handlePress = () => {
    setIsOpen(!isOpen);
    height.value = withTiming(isOpen ? 0 : contentHeight, {
      duration: 300,
    });
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.header, isOpen && styles.headerOpen]}
        onPress={handlePress}
      >
        {icon && <View style={styles.iconContainer}>{/* 渲染图标 */}</View>}
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.arrow, isOpen && styles.arrowOpen]} />
      </TouchableOpacity>

      <Animated.View style={[styles.content, animatedStyles]}>
        <View style={styles.childrenContainer}>
          {children.map((item) => (
            <MenuItem key={item.id} {...item} onSelect={onSelect} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: MENU_LAYOUT.itemHeight,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MENU_LAYOUT.itemPadding,
    backgroundColor: colors.whiteBk,
  },
  headerOpen: {
    backgroundColor: colors.gridLine,
  },
  iconContainer: {
    width: MENU_LAYOUT.iconSize,
    height: MENU_LAYOUT.iconSize,
    marginRight: MENU_LAYOUT.itemPadding,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: colors.axisLabel,
  },
  arrow: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.axisLine,
    transform: [{ rotate: "45deg" }],
  },
  arrowOpen: {
    transform: [{ rotate: "-135deg" }],
  },
  content: {
    overflow: "hidden",
  },
  childrenContainer: {
    paddingLeft: MENU_LAYOUT.subMenuIndent,
  },
});
