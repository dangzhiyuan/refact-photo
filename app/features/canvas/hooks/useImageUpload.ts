import { useCallback } from "react";
import { useCanvasStore } from "../../../store/useCanvasStore";
import { Skia } from "@shopify/react-native-skia";

export const useImageUpload = () => {
  const { addLayer } = useCanvasStore();

  const handleImageUpload = useCallback(
    async (uri: string) => {
      try {
        // 加载图片为 SkImage
        const response = await fetch(uri);
        const imageData = await response.arrayBuffer();
        const image = Skia.Image.MakeImageFromEncoded(
          Skia.Data.fromBytes(new Uint8Array(imageData))
        );

        if (image) {
          // 创建图层
          const layer = createImageLayer(image);
          addLayer(layer);
        }
      } catch (error) {
        console.error("Failed to load image:", error);
      }
    },
    [addLayer]
  );

  return { handleImageUpload };
};
