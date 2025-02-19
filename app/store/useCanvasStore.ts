import { create } from "zustand";
import { Layer, ImageLayer, TextLayer, Adjustments } from "../types/layer";
import { SkImage } from "@shopify/react-native-skia";

interface CanvasState {
  layers: Layer[];
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  addLayer: (layer: Layer) => void;
  updateLayer: <T extends Layer>(id: string, updates: Partial<T>) => void;
  moveLayer: (id: string, position: { x: number; y: number }) => void;
  transformLayer: (id: string, scale: number, rotation: number) => void;
  updateLayerAdjustments: (
    id: string,
    adjustments: Partial<Adjustments>
  ) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
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
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? ({ ...layer, ...updates } as Layer) : layer
      ),
    })),

  moveLayer: (id, position) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id
          ? {
              ...layer,
              transform: {
                ...layer.transform,
                position,
              },
            }
          : layer
      ),
    })),

  transformLayer: (id, scale, rotation) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id
          ? {
              ...layer,
              transform: {
                ...layer.transform,
                scale,
                rotation,
              },
            }
          : layer
      ),
    })),

  updateLayerAdjustments: (id, adjustments) =>
    set((state) => ({
      layers: state.layers.map((layer) => {
        if (layer.id === id && layer.type === "image") {
          return {
            ...layer,
            adjustments: {
              ...layer.adjustments,
              ...adjustments,
            },
          };
        }
        return layer;
      }),
    })),
}));

// 工具函数
export const createImageLayer = (imageSource: SkImage): ImageLayer => ({
  id: `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: "新建图片",
  type: "image",
  transform: {
    position: { x: 0, y: 0 },
    scale: 1,
    rotation: 0,
  },
  isVisible: true,
  opacity: 1,
  blendMode: "normal",
  zIndex: Date.now(),
  imageSource,
  filterType: "normal",
  filterIntensity: 0,
  adjustments: {
    brightness: 0,
    contrast: 0,
    saturation: 1,
    temperature: 0,
  },
});

export const createTextLayer = (text: string = "新建文本"): TextLayer => ({
  id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: "新建文本",
  type: "text",
  transform: {
    position: { x: 100, y: 100 },
    scale: 1,
    rotation: 0,
  },
  isVisible: true,
  opacity: 1,
  blendMode: "normal",
  zIndex: Date.now(),
  text,
  fontSize: 24,
  color: "#000000",
});
