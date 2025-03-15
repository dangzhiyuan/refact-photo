import { create } from "zustand";
import { EditorMode } from "../core/types/canvas";
import { updateObject } from "../utils/storeHelpers";

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

  // 画布变换状态
  baseCanvasTransform: TransformState;
  contentCanvasTransform: TransformState;

  // Actions
  setMode: (mode: EditorMode) => void;
  setBaseImageUri: (uri: string) => void;
  setFilter: (filter: string) => void;
  updateAdjustments: (
    adjustments: Partial<EditorStoreState["adjustments"]>
  ) => void;
  resetAdjustments: () => void; 
  updateBaseCanvasTransform: (transform: Partial<TransformState>) => void;
  updateContentCanvasTransform: (transform: Partial<TransformState>) => void;
  
  // 添加重置所有状态的方法
  resetAll: () => void;
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

// 定义初始状态对象，便于重置和重用
const initialState = {
  currentMode: EditorMode.EDIT,
  baseImageUri: null,
  currentFilter: "normal",
  adjustments: { ...defaultAdjustments },
  baseCanvasTransform: { ...defaultTransform },
  contentCanvasTransform: { ...defaultTransform },
};

export const useEditorStore = create<EditorStoreState>((set) => ({
  // 使用初始状态对象
  ...initialState,

  // 基本设置动作
  setMode: (mode) => set({ currentMode: mode }),
  setBaseImageUri: (uri) => set({ baseImageUri: uri }),
  setFilter: (filter) => set({ currentFilter: filter }),

  // 使用辅助函数简化调整参数更新
  updateAdjustments: (adjustments) =>
    set((state) => updateObject(state, 'adjustments', adjustments)),

  // 重置调整
  resetAdjustments: () => set({ adjustments: { ...defaultAdjustments } }),

  // 更新画布变换状态，使用辅助函数处理深层次更新
  updateBaseCanvasTransform: (transform) =>
    set((state) => {
      // 特殊处理position字段，确保部分更新时保留现有坐标
      const position = transform.position 
        ? { 
            ...state.baseCanvasTransform.position,
            ...transform.position 
          }
        : undefined;
        
      // 创建最终的更新对象
      const finalTransform = {
        ...transform,
        ...(position ? { position } : {})
      };
      
      return updateObject(state, 'baseCanvasTransform', finalTransform);
    }),

  // 更新内容画布变换状态
  updateContentCanvasTransform: (transform) =>
    set((state) => {
      // 特殊处理position字段，确保部分更新时保留现有坐标
      const position = transform.position 
        ? { 
            ...state.contentCanvasTransform.position,
            ...transform.position 
          }
        : undefined;
        
      // 创建最终的更新对象
      const finalTransform = {
        ...transform,
        ...(position ? { position } : {})
      };
      
      return updateObject(state, 'contentCanvasTransform', finalTransform);
    }),
    
  // 重置所有状态
  resetAll: () => set({ ...initialState }),
}));
