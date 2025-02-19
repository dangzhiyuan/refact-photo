// 定义 LUT 类型
export type LutType = "normal" | "lut1" | "lut2" | "lut3" | "lut4" | "lut5";

// 定义 LUT 图片映射类型
export type LutImageMap = {
  [K in LutType]: K extends "normal" ? null : number;
};

// LUT 图片资源
export const LutImages: LutImageMap = {
  normal: null,
  lut1: require("./luts/001.jpeg"),
  lut2: require("./luts/002.jpeg"),
  lut3: require("./luts/003.jpeg"),
  lut4: require("./luts/004.jpeg"),
  lut5: require("./luts/005.jpeg"),
} as const;

// LUT 工具函数
export const getLutImage = (type: LutType) => {
  if (type === "normal") return null;

  const lutImage = LutImages[type];
  if (!lutImage) {
    console.warn(`Invalid LUT type: ${type}`);
    return null;
  }

  return lutImage;
};

// 导出预览图片
export const LutPreviews: Record<LutType, any> = {
  normal: null,
  lut1: require("./luts/001.jpeg"),
  lut2: require("./luts/002.jpeg"),
  lut3: require("./luts/003.jpeg"),
  lut4: require("./luts/004.jpeg"),
  lut5: require("./luts/005.jpeg"),
};
