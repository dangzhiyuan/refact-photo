import React from "react";
import { StyleSheet } from "react-native";
import { Canvas, Group, Text, useFont } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useEditorStore } from "../../store/editorStore";
import { useTextStore } from "../../store/textStore";

interface TextCanvasProps {
  width: number;
  height: number;
}

export const TextCanvas: React.FC<TextCanvasProps> = ({ width, height }) => {
  const { viewTransform, selectedLayerId, selectLayer } = useEditorStore();
  const { textItems, updateTextTransform } = useTextStore();

  // 默认字体 (可以加载多种字体)
  const font = useFont("Roboto", 24);

  if (!font) return null;

  return (
    <Canvas style={[styles.canvas, { width, height }]}>
      <Group
        transform={[
          { translateX: viewTransform.translateX },
          { translateY: viewTransform.translateY },
          { scale: viewTransform.scale },
        ]}
      >
        {textItems.map((item) => (
          <TextItem
            key={item.id}
            item={item}
            font={font}
            isSelected={selectedLayerId === item.id}
            onSelect={() => selectLayer(item.id)}
            onTransform={updateTextTransform}
          />
        ))}
      </Group>
    </Canvas>
  );
};

// 文本项组件
const TextItem = ({ item, font, isSelected, onSelect, onTransform }) => {
  // 手势逻辑 - 类似StickerItem，处理拖拽、缩放、旋转

  return (
    <Group
      transform={[
        { translateX: item.position.x },
        { translateY: item.position.y },
        { scale: item.scale },
        { rotate: item.rotation },
      ]}
    >
      <Text
        font={font}
        text={item.text}
        x={0}
        y={0}
        color={item.color}
        opacity={isSelected ? 0.9 : 1}
      />
      {isSelected && (
        // 使用JSX风格的注释和一个简单的实现
        <Group>
          {/* 绘制选中状态边框 */}
          {/* 实际实现稍后完成 */}
        </Group>
      )}
    </Group>
  );
};

const styles = StyleSheet.create({
  canvas: {
    position: "absolute",
  },
});
