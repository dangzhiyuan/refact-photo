import { create } from "zustand";
import { EditorMode } from "../core/types/canvas";

// 定义变换状态的接口
export interface TransformState {
  scale: number;
  position: {
    x: number;
    y: number;
  };
}

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

  // 添加基础画布和内容画布的变换状态
  baseCanvasTransform: TransformState;
  contentCanvasTransform: TransformState;

  // 整合方法命名，移除重复
  setMode: (mode: EditorMode) => void;
  setBaseImageUri: (uri: string) => void; // 保留这个名称，移除setBaseImage
  setFilter: (filter: string) => void;
  updateAdjustments: (
    adjustments: Partial<EditorStoreState["adjustments"]>
  ) => void;
  resetAdjustments: () => void; // 新增方法：重置调整

  // 添加更新画布变换状态的方法
  updateBaseCanvasTransform: (transform: Partial<TransformState>) => void;
  updateContentCanvasTransform: (transform: Partial<TransformState>) => void;
}

// 定义默认调整参数
const defaultAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  vignette: 0,
};

// 定义默认变换状态
const defaultTransform: TransformState = {
  scale: 1,
  position: { x: 0, y: 0 },
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

  // 初始化基础画布和内容画布的变换状态
  baseCanvasTransform: { ...defaultTransform },
  contentCanvasTransform: { ...defaultTransform },

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

  // 更新基础画布变换状态
  updateBaseCanvasTransform: (transform) =>
    set((state) => ({
      baseCanvasTransform: {
        ...state.baseCanvasTransform,
        ...transform,
        // 如果传入的transform包含position但只有一个坐标，确保保留另一个坐标
        position: transform.position
          ? {
              ...state.baseCanvasTransform.position,
              ...transform.position,
            }
          : state.baseCanvasTransform.position,
      },
    })),

  // 更新内容画布变换状态
  updateContentCanvasTransform: (transform) =>
    set((state) => ({
      contentCanvasTransform: {
        ...state.contentCanvasTransform,
        ...transform,
        // 如果传入的transform包含position但只有一个坐标，确保保留另一个坐标
        position: transform.position
          ? {
              ...state.contentCanvasTransform.position,
              ...transform.position,
            }
          : state.contentCanvasTransform.position,
      },
    })),
}));
