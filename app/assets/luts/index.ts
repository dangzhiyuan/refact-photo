// 定义 LUT 图片资源
export const LutImages = {
  normal: null, // 原图不需要 LUT
  lut1: require("./001.jpeg"),
  lut2: require("./002.jpeg"),
  lut3: require("./003.jpeg"),
  lut4: require("./004.jpeg"),
  lut5: require("./005.jpeg"),
} as const;

// 导出 LUT 类型
export type LutType = keyof typeof LutImages;
