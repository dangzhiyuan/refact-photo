export interface Adjustments {
  brightness: number; // 亮度 (-0.5 到 0.5)
  contrast: number; // 对比度 (-0.5 到 0.5)
  saturation: number; // 饱和度 (0.5 到 1.5)
  temperature: number; // 色温 (-0.5 到 0.5)
}

export const defaultAdjustments: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 1,
  temperature: 0,
};
