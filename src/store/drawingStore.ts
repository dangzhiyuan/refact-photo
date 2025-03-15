import { create } from "zustand";
import { BrushType, BrushSettings, DrawingPath } from "../core/types/canvas";
import { generateId } from "../utils/idGenerator";
import { MAX_RECENT_COLORS } from "../core/constants";
import { 
  updateObject, 
  updateNested, 
  addArrayItem 
} from "../utils/storeHelpers";

interface DrawingState {
  // 当前画笔设置
  currentBrush: {
    type: BrushType;
    color: string;
    strokeWidth: number;
    opacity: number;
    settings?: BrushSettings;
  };

  // 历史记录
  history: {
    paths: DrawingPath[];
    redoPaths: DrawingPath[];
  };

  // 最近使用的颜色
  recentColors: string[];

  // 当前正在绘制的路径
  currentPath: DrawingPath | null;

  // Actions
  setBrushType: (type: BrushType) => void;
  setBrushColor: (color: string) => void;
  setBrushWidth: (width: number) => void;
  setBrushOpacity: (opacity: number) => void;
  setBrushSettings: (settings: Partial<BrushSettings>) => void;

  // 绘画操作
  startPath: (point: { x: number; y: number }) => void;
  addPoint: (point: { x: number; y: number }) => void;
  endPath: () => void;

  // 历史记录操作
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

const initialBrushSettings: Record<BrushType, Partial<BrushSettings>> = {
  [BrushType.NORMAL]: {},
  [BrushType.SOFT]: { softness: 0.5 },
  [BrushType.NEON]: { glowIntensity: 0.7 },
  [BrushType.MOSAIC]: { mosaicSize: 10 },
  [BrushType.BLUR]: { blurRadius: 10 },
  [BrushType.ERASER]: {},
};

// 定义初始状态
const initialState = {
  currentBrush: {
    type: BrushType.NORMAL,
    color: "#000000",
    strokeWidth: 5,
    opacity: 1,
    settings: {},
  },
  history: {
    paths: [],
    redoPaths: [],
  },
  recentColors: [],
  currentPath: null,
};

export const useDrawingStore = create<DrawingState>((set, get) => ({
  ...initialState,

  setBrushType: (type) => {
    set((state) => 
      updateObject(state, 'currentBrush', {
        type,
        settings: initialBrushSettings[type],
      })
    );
  },

  setBrushColor: (color) => {
    set((state) => {
      // 更新最近使用的颜色
      const recentColors = [
        color,
        ...state.recentColors.filter((c) => c !== color),
      ].slice(0, MAX_RECENT_COLORS);

      // 使用辅助函数更新多个状态
      const stateWithBrushUpdate = updateObject(state, 'currentBrush', { color });
      return {
        ...stateWithBrushUpdate,
        recentColors
      };
    });
  },

  setBrushWidth: (width) => {
    set((state) => 
      updateObject(state, 'currentBrush', { strokeWidth: width })
    );
  },

  setBrushOpacity: (opacity) => {
    set((state) => 
      updateObject(state, 'currentBrush', { opacity })
    );
  },

  setBrushSettings: (settings) => {
    set((state) => 
      updateNested(state, ['currentBrush', 'settings'], settings)
    );
  },

  startPath: (point) => {
    const { currentBrush } = get();
    const newPath: DrawingPath = {
      id: generateId("path"),
      points: [point],
      color: currentBrush.color,
      strokeWidth: currentBrush.strokeWidth,
      opacity: currentBrush.opacity,
      brushType: currentBrush.type,
      brushSettings: currentBrush.settings,
    };

    set({ currentPath: newPath });
  },

  addPoint: (point) => {
    set((state) => {
      if (!state.currentPath) return state;

      return updateNested(state, ['currentPath'], {
        points: [...state.currentPath.points, point],
      });
    });
  },

  endPath: () => {
    set((state) => {
      if (!state.currentPath) return state;

      // 使用嵌套更新添加路径到历史记录
      const updatedState = updateNested(state, ['history'], {
        paths: [...state.history.paths, state.currentPath],
        redoPaths: [], // 清空重做历史
      });
      
      // 然后清除当前路径
      return {
        ...updatedState,
        currentPath: null
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.history.paths.length === 0) return state;

      const paths = [...state.history.paths];
      const lastPath = paths.pop()!;

      return updateObject(state, 'history', {
        paths,
        redoPaths: [...state.history.redoPaths, lastPath],
      });
    });
  },

  redo: () => {
    set((state) => {
      if (state.history.redoPaths.length === 0) return state;

      const redoPaths = [...state.history.redoPaths];
      const pathToRestore = redoPaths.pop()!;

      return updateObject(state, 'history', {
        paths: [...state.history.paths, pathToRestore],
        redoPaths,
      });
    });
  },

  clear: () => {
    // 重置历史记录和当前路径，但保留画笔设置
    set((state) => ({
      ...state,
      history: {
        paths: [],
        redoPaths: [],
      },
      currentPath: null,
    }));
  },
}));
