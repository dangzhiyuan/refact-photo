import { create } from "zustand";

interface UserSettings {
  // 调试模式
  isDebugMode: boolean;
  toggleDebugMode: () => void;

  // 实时交互
  isRealTimeMode: boolean;
  toggleRealTimeMode: () => void;

  // 性能模式
  isHighPerformanceMode: boolean;
  togglePerformanceMode: () => void;
}

export const useUserSettings = create<UserSettings>((set) => ({
  isDebugMode: __DEV__, // 开发模式下默认启用调试
  toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),

  isRealTimeMode: true, // 默认启用实时交互
  toggleRealTimeMode: () =>
    set((state) => ({ isRealTimeMode: !state.isRealTimeMode })),

  isHighPerformanceMode: false,
  togglePerformanceMode: () =>
    set((state) => ({ isHighPerformanceMode: !state.isHighPerformanceMode })),
}));
