import React, { FC } from "react";
import { Rect } from "@shopify/react-native-skia";
import { Layer } from "../../../../types/layer";

interface SelectionBoxProps {
  layer: Layer;
}

export const SelectionBox: FC<SelectionBoxProps> = ({ layer }) => {
  // 暂时返回 null，后续实现选中框
  return null;
};
