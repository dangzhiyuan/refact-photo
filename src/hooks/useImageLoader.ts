import { useState, useEffect } from "react";
import { useImage } from "@shopify/react-native-skia";
import { useEditorStore } from "../store/editorStore";

export function useImageLoader(defaultUrl: string) {
  const [isLoading, setIsLoading] = useState(true);
  const baseImageUri = useEditorStore((state) => state.baseImageUri);
  const userImage = useImage(baseImageUri);
  const defaultImage = useImage(defaultUrl);
  const image = userImage || defaultImage;

  useEffect(() => {
    if (image) {
      setIsLoading(false);
    }
  }, [image]);

  return { image, isLoading };
}
