import { create } from "zustand";
import { SkPath } from "@shopify/react-native-skia";

interface DrawState {
  paths: SkPath[];
  currentPath: SkPath | null;
  color: string;
  strokeWidth: number;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  addPath: (path: SkPath) => void;
  updateCurrentPath: (path: SkPath) => void;
  clearCurrentPath: () => void;
}

export const useDrawStore = create<DrawState>((set) => ({
  paths: [],
  currentPath: null,
  color: "#000000",
  strokeWidth: 3,
  setColor: (color) => set({ color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  addPath: (path) =>
    set((state) => ({
      paths: [...state.paths, path],
      currentPath: null,
    })),
  updateCurrentPath: (path) => set({ currentPath: path }),
  clearCurrentPath: () => set({ currentPath: null }),
}));
