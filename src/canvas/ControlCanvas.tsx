import React from "react";
import { StyleSheet } from "react-native";
import { Canvas, Group, Rect, vec } from "@shopify/react-native-skia";
import { useCanvasStore } from "../store/canvasStore";
import { LayerType } from "../core/types/canvas";

export const ControlCanvas: React.FC = () => {
  // 获取选中图层
  const selectedLayer = useCanvasStore((state) => {
    const { selectedLayerId, layers } = state;
    return selectedLayerId ? layers[selectedLayerId] : null;
  });

  // 如果没有选中图层，不显示控制层
  if (!selectedLayer) {
    return null;
  }

  // 渲染选中框
  const renderSelectionBox = () => {
    // 根据图层类型确定选中框尺寸和位置
    let width = 100;
    let height = 100;

    // 实际应用中需要计算每种图层类型的准确尺寸
    // 这里简化处理

    const { position, scale, rotation } = selectedLayer.transform;

    return (
      <Group
        origin={vec(width / 2, height / 2)}
        transform={[
          { translateX: position.x },
          { translateY: position.y },
          { scale },
          { rotate: rotation },
        ]}
      >
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          color="transparent"
          style="stroke"
          strokeWidth={2}
          strokeColor="#00A2FF"
        />

        {/* 控制点 - 简化示例 */}
        <Rect x={-5} y={-5} width={10} height={10} color="#00A2FF" />

        <Rect x={width - 5} y={-5} width={10} height={10} color="#00A2FF" />

        <Rect x={-5} y={height - 5} width={10} height={10} color="#00A2FF" />

        <Rect
          x={width - 5}
          y={height - 5}
          width={10}
          height={10}
          color="#00A2FF"
        />
      </Group>
    );
  };

  return <Canvas style={styles.canvas}>{renderSelectionBox()}</Canvas>;
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});
