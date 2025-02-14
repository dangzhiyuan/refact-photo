export interface Adjustments {
  brightness: number; // 亮度 (-1.0 到 1.0)
  contrast: number; // 对比度 (-1.0 到 1.0)
  saturation: number; // 饱和度 (0.0 到 2.0)
  temperature: number; // 色温 (-1.0 到 1.0)
  exposure: number; // 曝光 (-1.0 到 1.0)
  highlights: number; // 高光 (-1.0 到 1.0)
  shadows: number; // 阴影 (-1.0 到 1.0)
  vignette: number; // 暗角 (0.0 到 1.0)
}

export const defaultAdjustments: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 1,
  temperature: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  vignette: 0,
};
