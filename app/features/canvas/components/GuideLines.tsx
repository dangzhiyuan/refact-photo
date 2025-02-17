import React, { FC } from "react";
import { Line, Group, Text } from "@shopify/react-native-skia";
import { colors } from "../../../constants/colors";

interface GuideLinesProps {
  width: number;
  height: number;
  visible?: boolean;
  showAxis?: boolean;
  showCrossLine?: boolean;
  step?: number;
}

export const GuideLines: FC<GuideLinesProps> = ({
  width,
  height,
  visible = true,
  showAxis = true,
  showCrossLine = true,
  step = 50,
}) => {
  if (!visible) return null;

  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <Group>
      {/* 十字线 */}
      {showCrossLine && (
        <>
          <Line
            p1={{ x: 0, y: centerY }}
            p2={{ x: width, y: centerY }}
            color={colors.axisLine}
            strokeWidth={1}
            style="stroke"
          />
          <Line
            p1={{ x: centerX, y: 0 }}
            p2={{ x: centerX, y: height }}
            color={colors.axisLine}
            strokeWidth={1}
            style="stroke"
          />
        </>
      )}

      {/* 坐标轴刻度 */}
      {showAxis && (
        <>
          {/* X轴刻度 */}
          {Array.from({ length: Math.floor(width / step) + 1 }).map(
            (_, index) => {
              const x = index * step;
              return (
                <Group key={`x-${index}`}>
                  <Line
                    p1={{ x, y: centerY - 3 }}
                    p2={{ x, y: centerY + 3 }}
                    color={colors.axisLine}
                    strokeWidth={1}
                  />
                  <Text
                    text={`${x}`}
                    x={x - 10}
                    y={centerY + 15}
                    color={colors.axisText}
                    font={null}
                  />
                </Group>
              );
            }
          )}

          {/* Y轴刻度 */}
          {Array.from({ length: Math.floor(height / step) + 1 }).map(
            (_, index) => {
              const y = index * step;
              return (
                <Group key={`y-${index}`}>
                  <Line
                    p1={{ x: centerX - 3, y }}
                    p2={{ x: centerX + 3, y }}
                    color={colors.axisLine}
                    strokeWidth={1}
                  />
                  <Text
                    text={`${y}`}
                    x={centerX + 8}
                    y={y + 4}
                    color={colors.axisText}
                    font={null}
                  />
                </Group>
              );
            }
          )}
        </>
      )}
    </Group>
  );
};
