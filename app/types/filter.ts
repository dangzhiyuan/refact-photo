import { SkImage } from "@shopify/react-native-skia";

// LUT 滤镜类型
export type LutType = "normal" | "lut1" | "lut2" | "lut3" | "lut4" | "lut5";

// 滤镜配置
export interface FilterConfig {
  name: string; // 滤镜名称
  lutType: LutType; // LUT 类型
  intensity: number; // 强度 (0-1)
}

// 滤镜预设
export const FILTER_PRESETS: Record<LutType, FilterConfig> = {
  normal: { name: "原图", lutType: "normal", intensity: 1 },
  lut1: { name: "日系清新", lutType: "lut1", intensity: 1 },
  lut2: { name: "复古胶片", lutType: "lut2", intensity: 1 },
  lut3: { name: "暖阳", lutType: "lut3", intensity: 1 },
  lut4: { name: "冷调", lutType: "lut4", intensity: 1 },
  lut5: { name: "黑白", lutType: "lut5", intensity: 1 },
} as const;
