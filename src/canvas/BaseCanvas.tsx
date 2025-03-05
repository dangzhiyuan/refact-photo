import React, { useEffect } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { Canvas, Image, useImage, Paint } from "@shopify/react-native-skia";
import { useEditorStore } from "../store/editorStore";
import { useCanvasStore } from "../store/canvasStore";

export const BaseCanvas: React.FC = () => {
  // 获取编辑器状态
  const { baseImageUri, currentFilter, adjustments } = useEditorStore(
    (state) => ({
      baseImageUri: state.baseImageUri,
      currentFilter: state.currentFilter,
      adjustments: state.adjustments,
    })
  );

  // 获取画布状态
  const updateViewport = useCanvasStore((state) => state.updateViewport);

  // 加载图像
  const image = useImage(baseImageUri);

  // 更新视口尺寸
  useEffect(() => {
    if (image) {
      const { width, height } = Dimensions.get("window");
      const imageAspect = image.height() / image.width();
      const screenAspect = height / width;

      let imageWidth = width;
      let imageHeight = width * imageAspect;

      if (imageAspect > screenAspect) {
        imageHeight = height;
        imageWidth = height / imageAspect;
      }

      updateViewport({
        size: { width: imageWidth, height: imageHeight },
      });
    }
  }, [image]);

  if (!image) {
    return null;
  }

  return (
    <Canvas style={styles.canvas}>
      <Image
        image={image}
        fit="contain"
        x={0}
        y={0}
        width={Dimensions.get("window").width}
        height={Dimensions.get("window").height}
      ></Image>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});
