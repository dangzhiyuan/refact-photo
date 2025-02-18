import { Platform } from "react-native";

// 定义 LUT 图片资源
export const LutImages = {
  normal: null, // 原图不需要 LUT
  lut1: Platform.select({
    ios: require("./001.jpeg"),
    android: { uri: "asset:/001.jpeg" },
  }),
  lut2: Platform.select({
    ios: require("./002.jpeg"),
    android: { uri: "asset:/002.jpeg" },
  }),
  lut3: Platform.select({
    ios: require("./003.jpeg"),
    android: { uri: "asset:/003.jpeg" },
  }),
  lut4: Platform.select({
    ios: require("./004.jpeg"),
    android: { uri: "asset:/004.jpeg" },
  }),
  lut5: Platform.select({
    ios: require("./005.jpeg"),
    android: { uri: "asset:/005.jpeg" },
  }),
} as const;

// 导出 LUT 类型
export type LutType = keyof typeof LutImages;
