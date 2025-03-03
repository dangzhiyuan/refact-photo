import React, { FC } from "react";
import { Group } from "@shopify/react-native-skia";
import { LayerRendererProps } from "../../../../types/renderer";

// 简化为纯渲染组件，移除任何手势和选择逻辑
export const BaseRenderer: FC<LayerRendererProps> = ({
  layer,
  isSelected,
  children,
}) => {
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
