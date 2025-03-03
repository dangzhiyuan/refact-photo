import React, { FC } from "react";
import { Rect, Text, Group } from "@shopify/react-native-skia";

interface SkiaErrorDisplayProps {
  message: string;
}

export const SkiaErrorDisplay: FC<SkiaErrorDisplayProps> = ({ message }) => {
  return (
    <Group>
      {/* 错误背景 */}
      <Rect
        x={10}
        y={10}
        width={300}
        height={100}
        color="rgba(255,0,0,0.2)"
        rx={8}
        ry={8}
      />
      {/* 错误文本 - 使用 Skia 的 Text 组件 */}
      <Text
        x={20}
        y={40}
        text="渲染错误"
        font={{ family: "Arial", size: 16 }}
        color="red"
      />
      <Text
        x={20}
        y={70}
        text={message.length > 40 ? message.substring(0, 40) + "..." : message}
        font={{ family: "Arial", size: 12 }}
        color="#333"
      />
    </Group>
  );
};
