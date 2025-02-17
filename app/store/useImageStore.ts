import { create } from "zustand";
import { SkImage } from "@shopify/react-native-skia";

interface ImageState {
  selectedImage: SkImage | null;
  setSelectedImage: (image: SkImage | null) => void;
}

export const useImageStore = create<ImageState>((set) => ({
  selectedImage: null,
  setSelectedImage: (image) => set({ selectedImage: image }),
}));
