import { create } from "zustand";

interface RealTimeState {
  isRealTimeMode: boolean;
  toggleRealTimeMode: () => void;
}

export const useRealTimeStore = create<RealTimeState>((set) => ({
  isRealTimeMode: false,
  toggleRealTimeMode: () =>
    set((state) => ({ isRealTimeMode: !state.isRealTimeMode })),
}));
