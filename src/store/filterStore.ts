import { create } from "zustand";

export type Filter = {
  id: string;
  name: string;
  lutUri?: string;
  shader?: string;
};

interface FilterState {
  // 所有可用滤镜
  filters: Filter[];
  // 当前选中的滤镜
  currentFilter: string | null;
  // 滤镜强度
  intensity: number;
  
  // 操作方法
  setCurrentFilter: (filterId: string | null) => void;
  setIntensity: (intensity: number) => void;
}

// 预设滤镜列表
const defaultFilters: Filter[] = [
  { id: "original", name: "原图" },
  { id: "tokyo", name: "东京" },
  { id: "kyoto", name: "京都" },
  { id: "osaka", name: "大阪" },
  { id: "film", name: "胶片" },
  { id: "mono", name: "黑白" },
];

export const useFilterStore = create<FilterState>((set) => ({
  filters: defaultFilters,
  currentFilter: null,
  intensity: 1.0,
  
  setCurrentFilter: (filterId) => set({ currentFilter: filterId }),
  setIntensity: (intensity) => set({ intensity: Math.max(0, Math.min(intensity, 1)) }),
})); 