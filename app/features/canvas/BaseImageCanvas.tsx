import React, { useEffect, useMemo } from "react";
import { StyleSheet } from "react-native";
import {
  Canvas,
  Image,
  useImage,
  Paint,
  Shader,
} from "@shopify/react-native-skia";
import { useEditorStore } from "../../store/editorStore";
import { useBaseImageStore } from "../../store/baseImageStore";
import { createFilterShader } from "../../utils/shaderUtils";

interface BaseImageCanvasProps {
  width: number;
  height: number;
}

export const BaseImageCanvas: React.FC<BaseImageCanvasProps> = ({
  width,
  height,
}) => {
  const { viewTransform } = useEditorStore();
  const { imagePath, filter, adjustments } = useBaseImageStore();
  const image = useImage(imagePath);

  // 准备滤镜Shader
  const filterShader = useMemo(() => {
    if (!filter) return null;
    return createFilterShader(filter, adjustments);
  }, [filter, adjustments]);

  // 当没有图片时渲染空画布
  if (!image) {
    return (
      <Canvas style={[styles.canvas, { width, height }]}>
        {/* 可以添加默认内容 */}
      </Canvas>
    );
  }

  return (
    <Canvas style={[styles.canvas, { width, height }]}>
      <Image
        image={image}
        x={viewTransform.translateX}
        y={viewTransform.translateY}
        width={image.width() * viewTransform.scale}
        height={image.height() * viewTransform.scale}
        fit="contain"
      >
        {filterShader && (
          <Paint>
            <Shader shader={filterShader} />
          </Paint>
        )}
      </Image>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    position: "absolute",
  },
});
