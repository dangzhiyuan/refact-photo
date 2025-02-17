import React, { FC } from "react";
import { View, StyleSheet } from "react-native";
import { MenuProps, MenuItemType } from "../types/menu";
import { MenuItem } from "./MenuItem";
import { SubMenu } from "./SubMenu";
import { MenuDivider } from "./MenuDivider";
import { colors } from "../../../constants/colors";

export const Menu: FC<MenuProps> = ({ items, onSelect }) => {
  const renderItem = (item: MenuItemType) => {
    if (item.children) {
      return (
        <SubMenu
          key={item.id}
          label={item.label}
          icon={item.icon}
          children={item.children}
          onSelect={onSelect}
        />
      );
    }

    return <MenuItem key={item.id} {...item} onSelect={onSelect} />;
  };

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && <MenuDivider />}
          {renderItem(item)}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.whiteBk,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
