import React, { FC } from "react";
import { View, StyleSheet } from "react-native";
import { MENU_LAYOUT } from "../../../constants/layout";
import { colors } from "../../../constants/colors";

export const MenuDivider: FC = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  divider: {
    height: MENU_LAYOUT.dividerHeight,
    backgroundColor: colors.gridLine,
    marginVertical: MENU_LAYOUT.itemPadding / 2,
  },
});
