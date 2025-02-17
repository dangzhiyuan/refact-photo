import React, { FC } from "react";
import { View, StyleSheet } from "react-native";
import { Menu } from "./components/Menu";
import { MenuItemType } from "./types/menu";
import { colors } from "../../../constants/colors";

const menuItems: MenuItemType[] = [
  {
    id: "edit",
    label: "编辑",
    children: [
      {
        id: "undo",
        label: "撤销",
        onClick: () => console.log("撤销"),
      },
      {
        id: "redo",
        label: "重做",
        onClick: () => console.log("重做"),
      },
    ],
  },
  {
    id: "view",
    label: "视图",
    children: [
      {
        id: "zoomIn",
        label: "放大",
        onClick: () => console.log("放大"),
      },
      {
        id: "zoomOut",
        label: "缩小",
        onClick: () => console.log("缩小"),
      },
      {
        id: "fit",
        label: "适应屏幕",
        onClick: () => console.log("适应屏幕"),
      },
    ],
  },
  {
    id: "help",
    label: "帮助",
    onClick: () => console.log("帮助"),
  },
];

export const MenuExample: FC = () => {
  const handleSelect = (id: string) => {
    console.log("Selected:", id);
  };

  return (
    <View style={styles.container}>
      <Menu items={menuItems} onSelect={handleSelect} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.windowBk,
  },
});
