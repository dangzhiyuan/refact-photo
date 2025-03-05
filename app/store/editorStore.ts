import { create } from "zustand";

export type EditorTool =
  | "filter"
  | "drawing"
  | "sticker"
  | "text"
  | "template"
  | "none";
export type LayerType = "baseImage" | "drawing" | "sticker" | "text";

interface EditorState {
  // 当前选中的工具
  activeTool: EditorTool;
  // 当前选中的图层ID
  selectedLayerId: string | null;
  // 全局视图变换
  viewTransform: {
    scale: number;
    translateX: number;
    translateY: number;
  };
  // 图层列表 (按创建顺序排序)
  layers: Array<{
    id: string;
    type: LayerType;
    createdAt: number;
  }>;

  // 动作
  setActiveTool: (tool: EditorTool) => void;
  selectLayer: (id: string | null) => void;
  updateViewTransform: (
    transform: Partial<EditorState["viewTransform"]>
  ) => void;
  addLayer: (type: LayerType) => string; // 返回新图层ID
  removeLayer: (id: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  activeTool: "none",
  selectedLayerId: null,
  viewTransform: {
    scale: 1,
    translateX: 0,
    translateY: 0,
  },
  layers: [],

  setActiveTool: (tool) => set({ activeTool: tool }),

  selectLayer: (id) => set({ selectedLayerId: id }),

  updateViewTransform: (transform) =>
    set((state) => ({
      viewTransform: { ...state.viewTransform, ...transform },
    })),

  addLayer: (type) => {
    const newId = `${type}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    set((state) => ({
      layers: [...state.layers, { id: newId, type, createdAt: Date.now() }],
    }));
    return newId;
  },

  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((layer) => layer.id !== id),
    })),
}));
