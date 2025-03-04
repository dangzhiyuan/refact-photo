import React from "react";
import { Group, Path } from "@shopify/react-native-skia";
import { DrawingPath } from "../../store/drawingStore";

type BlackBorderBrushProps = {
  path: DrawingPath;
};

export const BlackBorderBrush = ({ path }: BlackBorderBrushProps) => {
  // 先画一个黑色边框，再在上面画彩色内容
  return (
    <Group>
      <Path
        path={path.path}
        color="black"
        style="stroke"
        strokeWidth={path.width + 2}
        strokeJoin="round"
        strokeCap="round"
      />
      <Path
        path={path.path}
        color={path.color}
        style="stroke"
        strokeWidth={path.width - 2}
        strokeJoin="round"
        strokeCap="round"
      />
    </Group>
  );
}; 