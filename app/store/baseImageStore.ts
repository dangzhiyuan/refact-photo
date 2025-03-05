import { create } from "zustand";
import { FilterType } from "../features/tools/filters/types";

interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  vignette: number;
  intensity: number;
}

interface BaseImageState {
  imagePath: string | null;
  filter: FilterType | null;
  adjustments: Adjustments;

  setImagePath: (path: string) => void;
  setFilter: (filter: FilterType | null) => void;
  updateAdjustments: (adjusts: Partial<Adjustments>) => void;
  resetAdjustments: () => void;
  setAdjustments: (adjustments: Partial<Adjustments>) => void;
}

const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 1,
  temperature: 0,
  vignette: 0,
  intensity: 1,
};

export const useBaseImageStore = create<BaseImageState>((set) => ({
  imagePath: null,
  filter: null,
  adjustments: { ...DEFAULT_ADJUSTMENTS },

  setImagePath: (path) => {
    console.log("设置图片路径:", path);
    set({ imagePath: path });
  },

  setFilter: (filter) => set({ filter }),

  updateAdjustments: (adjusts) =>
    set((state) => ({
      adjustments: { ...state.adjustments, ...adjusts },
    })),

  resetAdjustments: () => set({ adjustments: { ...DEFAULT_ADJUSTMENTS } }),

  setAdjustments: (newAdjustments) => {
    set((state) => ({
      adjustments: {
        ...state.adjustments,
        ...newAdjustments,
      },
    }));
  },
}));
