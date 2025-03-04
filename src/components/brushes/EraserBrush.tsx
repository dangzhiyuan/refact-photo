import React from "react";
import { Path, Group } from "@shopify/react-native-skia";
import { DrawingPath } from "../../store/drawingStore";

type EraserBrushProps = {
  path: DrawingPath;
};

export const EraserBrush = ({ path }: EraserBrushProps) => {
  return (
    <Group blendMode="clear">
      <Path
        path={path.path}
        color="white"
        style="stroke"
        strokeWidth={path.width}
        strokeJoin="round"
        strokeCap="round"
      />
    </Group>
  );
}; 