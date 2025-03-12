import { create } from "zustand";
import { generateId } from "../utils/idGenerator";
import {
  Layer,
  LayerType,
  Transform,
  CanvasType,
  DrawingPath,
} from "../core/types/canvas";

interface CanvasState {
  // 图层管理
  layers: Record<string, Layer>;
  layerIds: string[];
  selectedLayerId: string | null;
  activeCanvas: CanvasType;

  // 画布视图状态
  viewport: {
    scale: number;
    offset: { x: number; y: number };
    size: { width: number; height: number };
  };

  // 操作方法
  addLayer: (layer: Omit<Layer, "id">) => string;
  updateLayer: <T extends Layer>(
    id: string,
    updates: Partial<Omit<T, "id" | "type">>
  ) => void;
  moveLayer: (id: string, position: { x: number; y: number }) => void;
  transformLayer: (id: string, transform: Partial<Transform>) => void;
  deleteLayer: (id: string) => void;
  selectLayer: (id: string | null) => void;
  setActiveCanvas: (canvas: CanvasType) => void;

  // 图层排序
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  setLayerZIndex: (id: string, zIndex: number) => void;

  // 视口操作
  updateViewport: (updates: Partial<CanvasState["viewport"]>) => void;
  resetViewport: () => void;

  // 重置所有图层
  resetLayers: () => void;

  // 添加创建绘画图层的方法
  addDrawingLayer: (paths: DrawingPath[]) => string;
}

const DEFAULT_VIEWPORT = {
  scale: 1,
  offset: { x: 0, y: 0 },
  size: { width: 0, height: 0 },
};

// 初始状态
const initialState = {
  layers: {},
  layerIds: [],
  selectedLayerId: null,
  activeCanvas: CanvasType.BASE,
  viewport: DEFAULT_VIEWPORT,
};

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // 初始状态
  ...initialState,

  // 图层操作
  addLayer: (layerData) => {
    const id = generateId("layer");
    const layer = { ...layerData, id } as Layer;

    set((state) => ({
      layers: {
        ...state.layers,
        [id]: layer,
      },
      layerIds: [...state.layerIds, id],
    }));

    return id;
  },

  updateLayer: (id, updates) => {
    set((state) => {
      if (!state.layers[id]) return state;

      return {
        layers: {
          ...state.layers,
          [id]: {
            ...state.layers[id],
            ...updates,
          },
        },
      };
    });
  },

  moveLayer: (id, position) => {
    set((state) => {
      if (!state.layers[id]) return state;

      return {
        layers: {
          ...state.layers,
          [id]: {
            ...state.layers[id],
            transform: {
              ...state.layers[id].transform,
              position,
            },
          },
        },
      };
    });
  },

  transformLayer: (id, transform) => {
    set((state) => {
      if (!state.layers[id]) return state;

      return {
        layers: {
          ...state.layers,
          [id]: {
            ...state.layers[id],
            transform: {
              ...state.layers[id].transform,
              ...transform,
            },
          },
        },
      };
    });
  },

  // 图层排序功能
  moveLayerUp: (id) => {
    const state = get();
    if (!state.layers[id]) return;

    const currentZIndex = state.layers[id].zIndex;

    // 找到所有zIndex大于当前图层的图层
    const layersAbove = Object.entries(state.layers)
      .filter(([layerId, layer]) => layer.zIndex > currentZIndex)
      .sort((a, b) => a[1].zIndex - b[1].zIndex);

    if (layersAbove.length === 0) return; // 已经是最顶层

    // 获取紧邻上方的图层及其zIndex
    const [aboveId, aboveLayer] = layersAbove[0];
    const aboveZIndex = aboveLayer.zIndex;

    // 交换两个图层的zIndex
    set((state) => ({
      layers: {
        ...state.layers,
        [id]: {
          ...state.layers[id],
          zIndex: aboveZIndex,
        },
        [aboveId]: {
          ...state.layers[aboveId],
          zIndex: currentZIndex,
        },
      },
    }));
  },

  moveLayerDown: (id) => {
    const state = get();
    if (!state.layers[id]) return;

    const currentZIndex = state.layers[id].zIndex;

    // 找到所有zIndex小于当前图层的图层
    const layersBelow = Object.entries(state.layers)
      .filter(([layerId, layer]) => layer.zIndex < currentZIndex)
      .sort((a, b) => b[1].zIndex - a[1].zIndex); // 降序排列

    if (layersBelow.length === 0) return; // 已经是最底层

    // 获取紧邻下方的图层及其zIndex
    const [belowId, belowLayer] = layersBelow[0];
    const belowZIndex = belowLayer.zIndex;

    // 交换两个图层的zIndex
    set((state) => ({
      layers: {
        ...state.layers,
        [id]: {
          ...state.layers[id],
          zIndex: belowZIndex,
        },
        [belowId]: {
          ...state.layers[belowId],
          zIndex: currentZIndex,
        },
      },
    }));
  },

  setLayerZIndex: (id, zIndex) => {
    set((state) => {
      if (!state.layers[id]) return state;

      return {
        layers: {
          ...state.layers,
          [id]: {
            ...state.layers[id],
            zIndex,
          },
        },
      };
    });
  },

  deleteLayer: (id) => {
    set((state) => {
      const { [id]: _, ...remainingLayers } = state.layers;

      return {
        layers: remainingLayers,
        layerIds: state.layerIds.filter((layerId) => layerId !== id),
        selectedLayerId:
          state.selectedLayerId === id ? null : state.selectedLayerId,
      };
    });
  },

  selectLayer: (id) => {
    set({ selectedLayerId: id });
  },

  setActiveCanvas: (canvas) => {
    set({ activeCanvas: canvas });
  },

  // 视口操作
  updateViewport: (updates) => {
    set((state) => ({
      viewport: {
        ...state.viewport,
        ...updates,
      },
    }));
  },

  resetViewport: () => {
    set({ viewport: DEFAULT_VIEWPORT });
  },

  // 重置所有图层数据
  resetLayers: () => {
    set({
      layers: {},
      layerIds: [],
      selectedLayerId: null,
      activeCanvas: CanvasType.BASE,
    });
  },

  addDrawingLayer: (paths) => {
    const id = generateId("drawing");

    // 计算合适的zIndex
    let maxZIndex = 0;
    const { layers, layerIds } = get();
    for (const layerId of layerIds) {
      if (layers[layerId] && layers[layerId].zIndex > maxZIndex) {
        maxZIndex = layers[layerId].zIndex;
      }
    }

    const layer: Layer = {
      id,
      type: LayerType.DRAWING,
      zIndex: maxZIndex + 1, // 使用计算出的zIndex
      visible: true,
      opacity: 1,
      transform: {
        position: { x: 0, y: 0 },
        scale: 1,
        rotation: 0,
      },
      paths,
    };

    set((state) => ({
      layers: {
        ...state.layers,
        [id]: layer,
      },
      layerIds: [...state.layerIds, id],
    }));

    return id;
  },
}));
