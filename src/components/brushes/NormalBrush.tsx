import React from "react";
import { Path } from "@shopify/react-native-skia";
import { DrawingPath } from "../../types/drawing";

type NormalBrushProps = {
  path: DrawingPath;
};

export const NormalBrush = ({ path }: NormalBrushProps) => {
  return (
    <Path
      path={path.path}
      color={path.color}
      style="stroke"
      strokeWidth={path.width}
      strokeJoin="round"
      strokeCap="round"
    />
  );
}; 