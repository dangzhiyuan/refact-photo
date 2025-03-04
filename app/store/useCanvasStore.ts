import { create } from "zustand";
import { getCanvasDimensions } from "../constants/layout";

interface CanvasSize {
  width: number;
  height: number;
}

interface CanvasState {
  size: CanvasSize;
  defaultSize: CanvasSize;
  setCanvasSize: (size: CanvasSize) => void;
  resetToDefaultSize: () => void;
}

// 初始值使用当前的画布尺寸
const initialDimensions = getCanvasDimensions();

export const useCanvasStore = create<CanvasState>((set) => ({
  size: {
    width: initialDimensions.canvasWidth,
    height: initialDimensions.canvasHeight,
  },
  defaultSize: {
    width: initialDimensions.canvasWidth,
    height: initialDimensions.canvasHeight,
  },
  setCanvasSize: (newSize) => set({ size: newSize }),
  resetToDefaultSize: () => set((state) => ({ size: state.defaultSize })),
}));

// 导出便捷函数
export const setCanvasSize = (size: CanvasSize) => {
  useCanvasStore.getState().setCanvasSize(size);
};
