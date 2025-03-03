import { create } from "zustand";

interface DrawModeState {
  isDrawMode: boolean;
  activeColor: string;
  strokeWidth: number;
  setDrawMode: (isDrawMode: boolean) => void;
  setActiveColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
}

export const useDrawModeStore = create<DrawModeState>((set) => ({
  isDrawMode: false,
  activeColor: "#000000",
  strokeWidth: 3,
  setDrawMode: (isDrawMode) => set({ isDrawMode }),
  setActiveColor: (activeColor) => set({ activeColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
}));
