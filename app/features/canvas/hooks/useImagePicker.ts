import { useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { useImageStore } from "../../../store/useImageStore";
import { Skia } from "@shopify/react-native-skia";

export const useImagePicker = () => {
  const { setSelectedImage } = useImageStore();

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const imageData = await fetch(result.assets[0].uri);
        const imageBuffer = await imageData.arrayBuffer();
        const data = Skia.Data.fromBytes(new Uint8Array(imageBuffer));
        const image = Skia.Image.MakeImageFromEncoded(data);
        if (image) {
          setSelectedImage(image);
        }
      } catch (error) {
        console.error("Failed to load image:", error);
      }
    }
  }, [setSelectedImage]);

  return { pickImage };
};
