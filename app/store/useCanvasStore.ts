import { create } from "zustand";
import { Layer, ImageLayer, TextLayer } from "../types/layer";
import { CanvasStore } from './storeTypes';
import { logger } from '../utils/logger';

interface CanvasStore {
  layers: Layer[];
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  moveLayer: (id: string, position: { x: number; y: number }) => void;
  transformLayer: (id: string, scale: number, rotation: number) => void;
  updateLayerAdjustments: (layerId: string, adjustments: Partial<Adjustments>) => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  layers: [],
  selectedLayerId: null,

  setSelectedLayerId: (id: string | null) => {
    try {
      set({ selectedLayerId: id });
    } catch (error) {
      logger.error('Error in setSelectedLayerId:', error);
    }
  },

  addLayer: (layer: Layer) => {
    try {
      set((state) => ({ layers: [...state.layers, layer] }));
    } catch (error) {
      logger.error('Error in addLayer:', error);
    }
  },

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

  moveLayer: (id: string, position: { x: number; y: number }) => {
    try {
      const layers = get().layers.map((layer) =>
        layer.id === id ? { ...layer, position } : layer
      );
      set({ layers });
    } catch (error) {
      logger.error('Error in moveLayer:', error);
    }
  },

  transformLayer: (id: string, scale: number, rotation: number) => {
    try {
      const layers = get().layers.map((layer) =>
        layer.id === id ? { ...layer, scale, rotation } : layer
      );
      set({ layers });
    } catch (error) {
      logger.error('Error in transformLayer:', error);
    }
  },

  updateLayerAdjustments: (layerId: string, adjustments: Partial<Adjustments>) => {
    try {
      console.log('Store updating adjustments:', {
        layerId,
        adjustments
      });
      set((state) => {
        const newLayers = state.layers.map((layer) => {
          if (layer.id === layerId && layer.type === 'image') {
            const newLayer = {
              ...layer,
              adjustments: {
                brightness: 0,
                contrast: 0,
                saturation: 1,
                temperature: 0,
                ...layer.adjustments,
                ...adjustments,
              },
            };
            console.log('Updated layer:', newLayer);
            return newLayer;
          }
          return layer;
        });
        return { layers: newLayers };
      });
    } catch (error) {
      console.error('Error in updateLayerAdjustments:', error);
    }
  },
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
