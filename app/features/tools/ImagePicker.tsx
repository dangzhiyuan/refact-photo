import { useCanvasStore } from "../../store/useCanvasStore";
import * as ImagePicker from "expo-image-picker";

export const useImagePicker = () => {
  const { addLayer } = useCanvasStore();

  const pickImage = async () => {
    try {
      // 基本的图片选择
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false, // 先禁用编辑功能
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        // 直接使用选择的图片
        addLayer({
          type: "image",
          position: { x: 0, y: 0 },
          scale: 1,
          rotation: 0,
          opacity: 1,
          imageSource: result.assets[0].uri,
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  return { pickImage };
};
