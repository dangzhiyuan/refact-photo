export const LutImages = {
  // normal: require("./normal.png"),
  lut1: require("./001.jpeg"),
  lut2: require("./002.jpeg"),
  lut3: require("./003.jpeg"),
  lut4: require("./004.jpeg"),
  lut5: require("./005.jpeg"),
} as const;

// 添加类型
export type LutType = keyof typeof LutImages;
