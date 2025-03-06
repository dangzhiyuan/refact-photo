import { create } from "zustand";
import { EditorMode } from "../core/types/canvas";

export interface EditorStoreState {
  currentMode: EditorMode;
  baseImageUri: string | null;
  currentFilter: string;
  adjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
    temperature: number;
    vignette: number;
  };

  // 整合方法命名，移除重复
  setMode: (mode: EditorMode) => void;
  setBaseImageUri: (uri: string) => void; // 保留这个名称，移除setBaseImage
  setFilter: (filter: string) => void;
  updateAdjustments: (
    adjustments: Partial<EditorStoreState["adjustments"]>
  ) => void;
  resetAdjustments: () => void; // 新增方法：重置调整
}

// 定义默认调整参数
const defaultAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  vignette: 0,
};

export const useEditorStore = create<EditorStoreState>((set) => ({
  // 默认为编辑模式
  currentMode: EditorMode.EDIT,

  // 默认图片可以设为null，BaseCanvas组件会处理显示默认图片
  baseImageUri: null,

  // 默认滤镜
  currentFilter: "normal",

  // 默认调整参数
  adjustments: { ...defaultAdjustments },

  // 设置当前编辑模式
  setMode: (mode) => set({ currentMode: mode }),

  // 设置基础图片URI - 只保留一个方法
  setBaseImageUri: (uri) => set({ baseImageUri: uri }),

  // 设置当前滤镜
  setFilter: (filter) => set({ currentFilter: filter }),

  // 更新调整参数
  updateAdjustments: (adjustments) =>
    set((state) => ({
      adjustments: { ...state.adjustments, ...adjustments },
    })),

  // 重置调整参数
  resetAdjustments: () => set({ adjustments: { ...defaultAdjustments } }),
}));
