import { useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { useLayerStore } from "../../../store/useLayerStore";
import { Skia } from "@shopify/react-native-skia";
import { generateId } from "../../../utils/idGenerator";
import { ImageLayer } from "../../../types/layer";
import { calculateFitSize } from "../../../utils/layoutUtils";
import { CANVAS_AREA } from "../../../constants/layout";

export const useImagePicker = () => {
  const { layers, addLayer } = useLayerStore();

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        // 获取文件名
        const uri = result.assets[0].uri;
        const fileName = uri.split("/").pop() || "未命名";

        const imageData = await fetch(uri);
        const imageBuffer = await imageData.arrayBuffer();
        const data = Skia.Data.fromBytes(new Uint8Array(imageBuffer));
        const image = Skia.Image.MakeImageFromEncoded(data);

        if (image) {
          const fitSize = calculateFitSize(image.width(), image.height());
          const centerX = (CANVAS_AREA.width - fitSize.width) / 2;
          const centerY = (CANVAS_AREA.height - fitSize.height) / 2;

          // 获取当前最大序号
          const maxOrder = Math.max(
            0,
            ...layers.map((l) => {
              const match = l.name.match(/^#(\d+)/);
              return match ? parseInt(match[1], 10) : 0;
            })
          );

          // 生成新的序号
          const newOrder = maxOrder + 1;
          const layerName = `#${newOrder} ${fileName.slice(0, 12)}`;

          const imageLayer: ImageLayer = {
            id: generateId(),
            type: "image",
            name: layerName,
            imageSource: image,
            isVisible: true,
            opacity: 1,
            blendMode: "normal",
            transform: {
              position: { x: centerX, y: centerY },
              scale: 1,
              rotation: 0,
            },
            zIndex: Date.now(),
          };

          addLayer(imageLayer);
        } else {
          console.error("Failed to create SkImage");
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  }, [layers, addLayer]);

  return { pickImage };
};
