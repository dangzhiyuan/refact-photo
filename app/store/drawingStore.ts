import { create } from "zustand";

interface StrokeStyle {
  color: string;
  width: number;
}

interface Stroke {
  path: string; // SVG路径或Skia路径的序列化表示
  style: StrokeStyle;
}

interface DrawingState {
  strokes: Stroke[];
  strokeStyle: StrokeStyle;
  isDrawing: boolean;

  setStrokeStyle: (style: Partial<StrokeStyle>) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  addStroke: (stroke: Stroke) => void;
  addPoint: (point: { x: number; y: number }) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

// 绘图状态管理
export const useDrawingStore = create<DrawingState>((set, get) => ({
  strokes: [],
  strokeStyle: { color: "#000000", width: 4 },
  isDrawing: false,
  undoStack: [],

  setStrokeStyle: (style) =>
    set((state) => ({
      strokeStyle: { ...state.strokeStyle, ...style },
    })),

  setIsDrawing: (isDrawing) => set({ isDrawing }),

  addStroke: (stroke) =>
    set((state) => ({
      strokes: [...state.strokes, stroke],
    })),

  addPoint: (point) => {
    // 简化版本，实际需要处理路径构建
    console.log("添加点:", point);
  },

  undo: () => {
    // 撤销最后一笔
    console.log("撤销");
  },

  redo: () => {
    // 重做操作
    console.log("重做");
  },

  clear: () => set({ strokes: [] }),
}));
