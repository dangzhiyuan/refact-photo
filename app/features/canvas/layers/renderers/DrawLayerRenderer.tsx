import React, { FC, useState, useEffect } from "react";
import { Group, Path, Circle } from "@shopify/react-native-skia";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import { LayerRendererProps } from "../../../../types/renderer";
import { DrawLayer } from "../../../../types/layer";

export const DrawLayerRenderer: FC<LayerRendererProps> = ({
  layer,
  isSelected,
}) => {
  const drawLayer = layer as DrawLayer;
  const { paths, color, strokeWidth, transform, opacity } = drawLayer;
  const [position, setPosition] = useState({ x: 100, y: 100 });

  // 使用共享的变换信息
  useEffect(() => {
    if (isSelected) {
      // 可以监听全局的变换状态
      // 根据需要更新位置
    }
  }, [isSelected]);

  const panGesture = Gesture.Pan().onUpdate((e) => {
    console.log("Pan update in DrawLayer:", e);
    setPosition((prev) => ({
      x: prev.x + e.translationX,
      y: prev.y + e.translationY,
    }));
  });

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={panGesture}>
        <Group
          transform={[
            { translateX: transform.position.x },
            { translateY: transform.position.y },
            { scale: transform.scale },
            { rotate: transform.rotation },
          ]}
          opacity={opacity}
        >
          {/* {paths.map((path, index) => (
            <Path
              key={index}
              path={path}
              color={color}
              style="stroke"
              strokeWidth={strokeWidth}
            />
          ))} */}
          <Circle cx={position.x} cy={position.y} r={100} color="red" />
        </Group>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};
