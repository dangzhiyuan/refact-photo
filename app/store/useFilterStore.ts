import { create } from 'zustand';

interface FilterState {
  intensity: number;
  setIntensity: (value: number) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  intensity: 1,
  setIntensity: (value) => set({ intensity: value }),
})); 