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
        const newDraggingLayers = new Set(state.draggingLayers);
        newDraggingLayers.delete(id);

        // 重要：不要立即删除临时位置，让它保持到下一次渲染
        // 当永久位置更新后，两者应该是相同的，所以不会有视觉跳跃
        // 可以在下一帧或短暂延迟后清除临时位置

        return {
          draggingLayers: newDraggingLayers,
          // 不要删除 positions[id]
        };
      });

      // 延迟清除临时位置，确保主状态已经更新
      setTimeout(() => {
        set((state) => {
          const newPositions = { ...state.positions };
          delete newPositions[id];
          return { positions: newPositions };
        });
      }, 50); // 短暂延迟，足够让渲染完成
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
