import React, { FC } from "react";
import { Line, Group } from "@shopify/react-native-skia";
import { CANVAS_AREA } from "../constants/layout";

interface CrossLineProps {
  color: string;
  strokeWidth?: number;
  opacity?: number;
}

export const CrossLine: FC<CrossLineProps> = ({
  color,
  strokeWidth = 1,
  opacity = 0.5,
}) => {
  // 计算中心点
  const centerX = CANVAS_AREA.width / 2;
  const centerY = CANVAS_AREA.height / 2;

  return (
    <Group opacity={opacity}>
      {/* 垂直线 */}
      <Line
        p1={{ x: centerX, y: 0 }}
        p2={{ x: centerX, y: CANVAS_AREA.height }}
        color={color}
        strokeWidth={strokeWidth}
        style="stroke"
      />
      {/* 水平线 */}
      <Line
        p1={{ x: 0, y: centerY }}
        p2={{ x: CANVAS_AREA.width, y: centerY }}
        color={color}
        strokeWidth={strokeWidth}
        style="stroke"
      />
    </Group>
  );
};
