import { create } from "zustand";
import { nanoid } from 'nanoid';
import { Skia, SkPath } from "@shopify/react-native-skia";
import { BrushType, PathPoint, DrawingPath } from "../types/drawing";

// 绘图状态类型
interface DrawingState {
  // 绘制路径列表
  paths: DrawingPath[];
  // 当前路径ID（正在绘制）
  currentPathId: string | null;
  // 绘制颜色
  color: string;
  // 笔刷宽度
  brushWidth: number;
  // 当前画笔类型
  brushType: string;
  // 是否处于绘制模式
  isDrawing: boolean;
  
  // 设置颜色
  setColor: (color: string) => void;
  // 设置笔刷宽度
  setBrushWidth: (width: number) => void;
  // 设置画笔类型
  setBrushType: (type: string) => void;
  // 开始绘制新路径
  startDrawing: (point: PathPoint, brushType?: string) => void;
  // 添加点到当前路径
  addPoint: (point: PathPoint) => void;
  // 结束当前绘制
  endDrawing: () => void;
  // 清除所有路径
  clearAll: () => void;
  // 撤销最后一条路径
  undo: () => void;
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
  paths: [],
  currentPathId: null,
  color: "#000000",
  brushWidth: 5,
  brushType: BrushType.Normal,
  isDrawing: false,
  
  // 设置颜色
  setColor: (color) => set({ color }),
  
  // 设置笔刷宽度
  setBrushWidth: (width) => set({ brushWidth: width }),
  
  // 设置画笔类型
  setBrushType: (type) => set({ brushType: type }),
  
  // 开始绘制新路径
  startDrawing: (point, brushType) => {
    const id = nanoid();
    const { color, brushWidth, brushType: currentBrushType } = get();
    
    // 创建默认的Skia路径
    const path = point.path || Skia.Path.Make();
    if (!point.path) {
      path.moveTo(point.x, point.y);
    }
    
    set(state => ({
      paths: [...state.paths, { 
        id, 
        points: [point], 
        path,
        color, 
        width: brushWidth,
        brushType: brushType || currentBrushType
      }],
      currentPathId: id,
      isDrawing: true
    }));
  },
  
  // 添加点到当前路径
  addPoint: (point) => {
    const { currentPathId, isDrawing } = get();
    
    if (!isDrawing || !currentPathId) return;
    
    set(state => ({
      paths: state.paths.map(path => 
        path.id === currentPathId
          ? { ...path, points: [...path.points, point] }
          : path
      )
    }));
  },
  
  // 结束当前绘制
  endDrawing: () => {
    set({ currentPathId: null, isDrawing: false });
  },
  
  // 清除所有路径
  clearAll: () => {
    set({ paths: [], currentPathId: null, isDrawing: false });
  },
  
  // 撤销最后一条路径
  undo: () => {
    set(state => ({
      paths: state.paths.slice(0, -1)
    }));
  }
})); 