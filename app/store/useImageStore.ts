import { create } from "zustand";
import { SkImage } from "@shopify/react-native-skia";

interface Transform {
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

interface ImageState {
  image: SkImage | null;
  transform: Transform;
  filterType: string;
  setImage: (image: SkImage | null) => void;
  setTransform: (transform: Transform) => void;
  setFilterType: (type: string) => void;
  resetTransform: () => void;
}

const initialTransform: Transform = {
  position: { x: 0, y: 0 },
  scale: 1,
  rotation: 0,
};

export const useImageStore = create<ImageState>((set) => ({
  image: null,
  transform: initialTransform,
  filterType: "normal",

  setImage: (image) => {
    console.log("Setting image to store:", {
      hasImage: !!image,
      size: image ? { width: image.width(), height: image.height() } : null,
    });
    set({
      image,
      // 重置变换
      transform: initialTransform,
    });
  },

  setTransform: (transform) => {
    console.log("Setting transform:", transform);
    set({ transform });
  },

  setFilterType: (filterType) => set({ filterType }),

  resetTransform: () => {
    console.log("Resetting transform");
    set({ transform: initialTransform });
  },
}));
