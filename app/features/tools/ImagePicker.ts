import * as ImagePicker from "expo-image-picker";
import { useCanvasStore } from "../../store/useCanvasStore";
import { Dimensions } from "react-native";
import { ImageLayer } from "../../types/layer";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const useImagePicker = () => {
  const { addLayer } = useCanvasStore();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      const { width, height } = result.assets[0];
      const scale = Math.min(screenWidth / width, screenHeight / height, 1);

      const newLayer: ImageLayer = {
        id: `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "image" as const,
        position: {
          x: (screenWidth - width * scale) / 2,
          y: (screenHeight - height * scale) / 2,
        },
        scale,
        rotation: 0,
        opacity: 1,
        imageSource: result.assets[0].uri,
        filterType: "normal",
        filterIntensity: 0,
      };

      console.log("Creating new layer:", newLayer);
      addLayer(newLayer);
    }
  };

  return { pickImage };
};
