import React, { FC } from "react";
import { Group } from "@shopify/react-native-skia";
import { LayerRendererProps } from "../../../../types/renderer";

// 简化为纯渲染组件，确保使用正确的变换属性
export const BaseRenderer: FC<LayerRendererProps> = ({
  layer,
  isSelected,
  children,
}) => {
  // 注意：这里使用的 layer.transform 可能已经包含临时位置
  return (
    <Group
      transform={[
        { translateX: layer.transform.position.x },
        { translateY: layer.transform.position.y },
        { scale: layer.transform.scale },
        { rotate: layer.transform.rotation },
      ]}
      opacity={layer.opacity}
    >
      {children}
      {/* 移除选择框逻辑，由单独的选择指示器处理 */}
    </Group>
  );
};
