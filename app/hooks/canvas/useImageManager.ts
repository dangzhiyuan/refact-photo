import { useState } from "react";
import { useLayerStore, createImageLayer } from "../../store/useLayerStore";
import { pickImage } from "../../utils/imageUtils";

export const useImageManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addLayer, selectLayer } = useLayerStore();

  const handlePickImage = async () => {
    try {
      setIsLoading(true);
      const image = await pickImage();
      if (image) {
        const layer = createImageLayer(image);
        addLayer(layer);
        selectLayer(layer.id);
      }
    } catch (error) {
      console.error("Failed to pick image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    pickImage: handlePickImage,
  };
};
