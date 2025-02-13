import { create } from "zustand";
import { Layer, ImageLayer, TextLayer } from "../types/layer";

interface CanvasStore {
  layers: Layer[];
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  moveLayer: (id: string, position: { x: number; y: number }) => void;
  transformLayer: (id: string, scale: number, rotation: number) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  layers: [],
  selectedLayerId: null,

  setSelectedLayerId: (id) => set({ selectedLayerId: id }),

  addLayer: (layer) =>
    set((state) => {
      console.log("Adding layer:", layer.id);
      return {
        layers: [...state.layers, layer],
        selectedLayerId: layer.id,
      };
    }),

  updateLayer: (id, updates) =>
    set((state) => {
      console.log("Updating layer:", {
        layerId: id,
        updates,
      });
      return {
        layers: state.layers.map((layer) =>
          layer.id === id ? { ...layer, ...updates } : layer
        ),
      };
    }),

  moveLayer: (id, position) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, position } : layer
      ),
    })),

  transformLayer: (id, scale, rotation) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, scale, rotation } : layer
      ),
    })),
}));

// 工具函数
export const createImageLayer = (imageSource: string): ImageLayer => {
  const id = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    type: "image",
    position: { x: 0, y: 0 },
    scale: 1,
    rotation: 0,
    opacity: 1,
    imageSource,
    filterType: "normal",
    filterIntensity: 0,
  };
};

export const createTextLayer = (text: string = "新建文本"): TextLayer => ({
  id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type: "text",
  text,
  fontSize: 24,
  color: "#000000",
  position: { x: 100, y: 100 },
  scale: 1,
  rotation: 0,
  opacity: 1,
  alignment: "left",
});
