import { create } from "zustand";
import { Layer } from "../types/layer";
import { generateId } from "../utils/idGenerator";

interface LayerState {
  layers: Layer[];
  selectedLayerId: string | null;
  displayIntensity: number;

  // 操作方法
  addLayer: (layer: Layer) => void;
  removeLayer: (layerId: string) => void;
  duplicateLayer: (layerId: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  setSelectedLayer: (layerId: string | null) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  setDisplayIntensity: (intensity: number) => void;
}

export const useLayerStore = create<LayerState>((set) => ({
  layers: [],
  selectedLayerId: null,
  displayIntensity: 1,

  addLayer: (layer) =>
    set((state) => ({
      layers: [...state.layers, layer],
      selectedLayerId: layer.id,
    })),

  removeLayer: (layerId) =>
    set((state) => ({
      layers: state.layers.filter((layer) => layer.id !== layerId),
      selectedLayerId:
        state.selectedLayerId === layerId ? null : state.selectedLayerId,
    })),

  duplicateLayer: (layerId) =>
    set((state) => {
      const layer = state.layers.find((l) => l.id === layerId);
      if (!layer) return state;

      const newLayer = {
        ...layer,
        id: generateId(),
        name: `${layer.name} Copy`,
        transform: {
          ...layer.transform,
          position: {
            x: layer.transform.position.x + 20,
            y: layer.transform.position.y + 20,
          },
        },
        zIndex: Date.now(),
      };

      return {
        layers: [...state.layers, newLayer],
        selectedLayerId: newLayer.id,
      };
    }),

  updateLayer: (id, updates) =>
    set((state) => {
      console.log("Updating layer:", { id, updates });
      const newLayers = state.layers.map((layer) =>
        layer.id === id ? { ...layer, ...updates } : layer
      );
      console.log("Updated layers:", newLayers);
      return { layers: newLayers };
    }),

  setSelectedLayer: (layerId) => set({ selectedLayerId: layerId }),

  reorderLayers: (fromIndex: number, toIndex: number) =>
    set((state) => {
      const sortedLayers = [...state.layers].sort(
        (a, b) => b.zIndex - a.zIndex
      );
      const [movedLayer] = sortedLayers.splice(fromIndex, 1);
      sortedLayers.splice(toIndex, 0, movedLayer);

      // 重新分配 zIndex
      const updatedLayers = sortedLayers.map((layer, index) => ({
        ...layer,
        zIndex: (sortedLayers.length - index) * 1000,
      }));

      return { layers: updatedLayers };
    }),

  setDisplayIntensity: (intensity) => set({ displayIntensity: intensity }),
}));
