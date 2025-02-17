import React, { FC } from "react";
import { Line, Group } from "@shopify/react-native-skia";
import { colors } from "../../../constants/colors";

interface CrossLineProps {
  x: number;
  y: number;
  width: number;
  height: number;
  visible?: boolean;
}

export const CrossLine: FC<CrossLineProps> = ({
  x,
  y,
  width,
  height,
  visible = true,
}) => {
  if (!visible) return null;

  return (
    <Group>
      {/* 水平线 */}
      <Line
        p1={{ x: 0, y }}
        p2={{ x: width, y }}
        color={colors.axisLine}
        strokeWidth={2}
        style="stroke"
      />
      {/* 垂直线 */}
      <Line
        p1={{ x, y: 0 }}
        p2={{ x, y: height }}
        color={colors.axisLine}
        strokeWidth={2}
        style="stroke"
      />
    </Group>
  );
};
