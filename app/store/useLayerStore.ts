import { create } from "zustand";
import { Layer, ImageLayer, TextLayer } from "../types/layer";
import { SkImage, BlendMode } from "@shopify/react-native-skia";
import { generateId } from "../utils/idGenerator";

interface LayerState {
  // 图层管理
  layers: Map<string, Layer>;
  selectedLayerId: string | null;

  // 图层操作
  addLayer: (layer: Layer) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (layerId: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  selectLayer: (id: string | null) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;

  // 变换操作
  moveLayer: (id: string, position: { x: number; y: number }) => void;
  transformLayer: (id: string, scale: number, rotation: number) => void;

  // 滤镜相关
  displayIntensity: number;
  setDisplayIntensity: (intensity: number) => void;
  updateLayerAdjustments: (id: string, adjustments: any) => void;
}

// 工具函数
export const createImageLayer = (imageSource: SkImage): ImageLayer => {
  const { layers } = useLayerStore.getState();
  const layerCount = layers.size;

  return {
    id: generateId(),
    name: `图片 ${layerCount + 1}`,
    type: "image",
    transform: {
      position: { x: 0, y: 0 },
      scale: 1,
      rotation: 0,
    },
    isVisible: true,
    opacity: 1,
    blendMode: BlendMode.SrcOver, // 修正 BlendMode
    zIndex: Date.now(),
    imageSource,
    filterType: "normal",
    filterIntensity: 0,
    adjustments: {
      brightness: 0,
      contrast: 0,
      saturation: 1,
      // temperature: 0,
    },
  };
};

export const createTextLayer = (text: string = "新建文本"): TextLayer => ({
  id: generateId(),
  name: "新建文本",
  type: "text",
  transform: {
    position: { x: 100, y: 100 },
    scale: 1,
    rotation: 0,
  },
  isVisible: true,
  opacity: 1,
  blendMode: BlendMode.SrcOver,
  zIndex: Date.now(),
  text,
  fontSize: 24,
  color: "#000000",
});

export const useLayerStore = create<LayerState>((set, get) => ({
  layers: new Map(),
  selectedLayerId: null,
  displayIntensity: 1,

  addLayer: (layer: Layer) => {
    set((state) => {
      const newLayers = new Map(state.layers);
      newLayers.set(layer.id, layer);

      // 找到 zIndex 最大的图层
      const topLayer = Array.from(newLayers.values()).reduce((prev, curr) =>
        curr.zIndex > prev.zIndex ? curr : prev
      );

      return {
        layers: newLayers,
        selectedLayerId: topLayer.id, // 自动选中最上层图层
      };
    });
  },

  removeLayer: (id) =>
    set((state) => {
      const newLayers = new Map(state.layers);
      newLayers.delete(id);
      return { layers: newLayers };
    }),

  duplicateLayer: (layerId) =>
    set((state) => {
      const layer = state.layers.get(layerId);
      if (!layer) return state;

      const newLayer: Layer = {
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

      const newLayers = new Map(state.layers);
      newLayers.set(newLayer.id, newLayer);
      return { layers: newLayers };
    }),

  updateLayer: (id, updates) =>
    set((state) => {
      const newLayers = new Map(state.layers);
      const layer = newLayers.get(id);
      if (layer) {
        newLayers.set(id, { ...layer, ...updates } as Layer);
      }
      return { layers: newLayers };
    }),

  selectLayer: (id) => set((state) => ({ selectedLayerId: id })),

  reorderLayers: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const layers = Array.from(state.layers.values()).sort(
        (a, b) => b.zIndex - a.zIndex
      );

      const [movedLayer] = layers.splice(fromIndex, 1);
      layers.splice(toIndex, 0, movedLayer);

      // 重新分配 zIndex
      const updatedLayers = layers.map((layer, index) => ({
        ...layer,
        zIndex: (layers.length - index) * 1000,
      }));

      const newLayers = new Map(updatedLayers.map((l) => [l.id, l]));

      // 更新后自动选中最上层
      const topLayer = updatedLayers[0];
      return {
        layers: newLayers,
        selectedLayerId: topLayer.id,
      };
    });
  },

  setDisplayIntensity: (intensity) =>
    set((state) => ({ displayIntensity: intensity })),

  moveLayer: (id, position) =>
    set((state) => {
      const newLayers = new Map(state.layers);
      const layer = newLayers.get(id);
      if (layer) {
        newLayers.set(id, {
          ...layer,
          transform: { ...layer.transform, position },
        } as Layer);
      }
      return { layers: newLayers };
    }),

  transformLayer: (id, scale, rotation) =>
    set((state) => {
      const newLayers = new Map(state.layers);
      const layer = newLayers.get(id);
      if (layer) {
        newLayers.set(id, {
          ...layer,
          transform: { ...layer.transform, scale, rotation },
        } as Layer);
      }
      return { layers: newLayers };
    }),

  updateLayerAdjustments: (id, adjustments) =>
    set((state) => {
      const newLayers = new Map(state.layers);
      const layer = newLayers.get(id);
      if (layer) {
        newLayers.set(id, { ...layer, adjustments } as Layer);
      }
      return { layers: newLayers };
    }),
}));
