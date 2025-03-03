import { create } from "zustand";

interface TempPositionStore {
  positions: Record<string, { x: number; y: number }>;
  draggingLayers: Set<string>;
  updatePosition: (id: string, x: number, y: number) => void;
  getPosition: (id: string) => { x: number; y: number } | null;
  markLayerAsDragging: (id: string, isDragging: boolean) => void;
  isLayerDragging: (id: string) => boolean;
  clearPosition: (id: string) => void;
  finishDragging: (id: string) => void;
}

// 临时位置存储，用于实时预览但不修改实际状态
export const useTempPositionStore = create<TempPositionStore>((set, get) => ({
  positions: {},
  draggingLayers: new Set<string>(),
  updatePosition: (id, x, y) =>
    set((state) => ({
      positions: {
        ...state.positions,
        [id]: { x, y },
      },
    })),
  getPosition: (id) => get().positions[id] || null,
  markLayerAsDragging: (id: string, isDragging: boolean) =>
    set((state) => {
      const newDraggingLayers = new Set(state.draggingLayers);
      if (isDragging) {
        newDraggingLayers.add(id);
      } else {
        newDraggingLayers.delete(id);
      }
      return { draggingLayers: newDraggingLayers };
    }),
  isLayerDragging: (id: string) => get().draggingLayers.has(id),
  clearPosition: (id: string) =>
    set((state) => {
      const newPositions = { ...state.positions };
      delete newPositions[id];
      return { positions: newPositions };
    }),
  finishDragging: (id: string) => {
    try {
      set((state) => {
        // 防御性编程：确保 id 存在
        if (!id) {
          console.warn("Attempted to finish dragging with null/undefined id");
          return state; // 不更改状态
        }

        // 创建新的拖动集合，排除当前图层
        const newDraggingLayers = new Set(
          Array.from(state.draggingLayers).filter((layerId) => layerId !== id)
        );

        // 创建新的位置对象，移除当前图层的临时位置
        const newPositions = { ...state.positions };
        if (id in newPositions) {
          delete newPositions[id];
        }

        console.log(
          `Finishing drag for ${id}, dragging layers will be:`,
          Array.from(newDraggingLayers)
        );

        return {
          draggingLayers: newDraggingLayers,
          positions: newPositions,
        };
      });
    } catch (error) {
      console.error("Error in finishDragging:", error);
    }
  },
}));

// 辅助函数
export const tempUpdateLayerPosition = (id: string, x: number, y: number) => {
  useTempPositionStore.getState().updatePosition(id, x, y);
};

// 新增：辅助函数用于标记图层拖动状态
export const markLayerAsDragging = (id: string, isDragging: boolean) => {
  useTempPositionStore.getState().markLayerAsDragging(id, isDragging);
};

// 添加辅助函数
export const clearTempPosition = (id: string) => {
  useTempPositionStore.getState().clearPosition(id);
};

// 添加一个一次性处理拖动结束的函数
export const finishDragging = (id: string) => {
  useTempPositionStore.getState().finishDragging(id);
};
