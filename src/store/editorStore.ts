import { create } from "zustand";

// 编辑器状态类型
interface EditorState {
  // 照片状态
  photo: {
    uri: string | null;
    transform: {
      scale: number;
      rotation: number;
      x: number;
      y: number;
    };
  };
  
  // 活动元素状态
  activeLayerId: string | null;
  activeLayerType: "photo" | "sticker" | "drawing" | "text" | null;
  
  // 编辑模式
  editorMode: "view" | "filter" | "sticker" | "drawing" | "text" | "adjust";
  
  // 历史记录
  history: any[];
  historyIndex: number;
  
  // 操作方法
  setPhoto: (uri: string) => void;
  transformPhoto: (transform: Partial<EditorState["photo"]["transform"]>) => void;
  setActiveLayer: (id: string | null, type: EditorState["activeLayerType"]) => void;
  setEditorMode: (mode: EditorState["editorMode"]) => void;
  
  // 历史记录操作
  addToHistory: (action: any) => void;
  undo: () => void;
  redo: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // 照片状态
  photo: { 
    uri: null, 
    transform: { scale: 1, rotation: 0, x: 0, y: 0 }
  },
  
  // 活动元素状态
  activeLayerId: null,
  activeLayerType: null,
  
  // 编辑模式
  editorMode: "view",
  
  // 历史记录
  history: [],
  historyIndex: -1,
  
  // 操作方法
  setPhoto: (uri) => set({ photo: { ...get().photo, uri } }),
  
  transformPhoto: (transform) => set({ 
    photo: { 
      ...get().photo, 
      transform: { ...get().photo.transform, ...transform } 
    } 
  }),
  
  setActiveLayer: (id, type) => set({ activeLayerId: id, activeLayerType: type }),
  
  setEditorMode: (mode) => set({ editorMode: mode }),
  
  // 历史记录操作
  addToHistory: (action) => set(state => {
    const newHistory = [...state.history.slice(0, state.historyIndex + 1), action];
    return {
      history: newHistory,
      historyIndex: newHistory.length - 1
    };
  }),
  
  undo: () => set(state => {
    if (state.historyIndex > 0) {
      return { historyIndex: state.historyIndex - 1 };
    }
    return state;
  }),
  
  redo: () => set(state => {
    if (state.historyIndex < state.history.length - 1) {
      return { historyIndex: state.historyIndex + 1 };
    }
    return state;
  }),
})); 