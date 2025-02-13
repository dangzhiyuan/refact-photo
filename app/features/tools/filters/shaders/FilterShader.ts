import { Skia } from "@shopify/react-native-skia";

export const FILTER_SHADER = Skia.RuntimeEffect.Make(`
  uniform shader image;
  uniform shader luts;
  uniform float intensity;
  uniform int hasLut;

  half4 main(float2 xy) {
    // 获取原始图片颜色
    vec4 color = image.eval(xy);
    
    if (hasLut == 1) {
      int r = int(color.r * 255.0 / 4);
      int g = int(color.g * 255.0 / 4);
      int b = int(color.b * 255.0 / 4);
      float lutX = float(int(mod(float(b), 8.0)) * 64 + r);
      float lutY = float(int((b / 8) * 64 + g));
      vec4 lutsColor = luts.eval(float2(lutX, lutY));
      return mix(color, lutsColor, intensity);
    }
    return color;
  }
`)!;

export const FILTER_NAMES = {
  normal: "normal",
  lut1: "lut1",
  lut2: "lut2",
  lut3: "lut3",
  lut4: "lut4",
  lut5: "lut5",
} as const;

export type FilterName = keyof typeof FILTER_NAMES;

// 添加调试辅助函数
export const isValidFilterName = (name: string): name is FilterName => {
  console.log("Shader - Checking filter name:", {
    name,
    isValid: name in FILTER_NAMES,
    availableNames: Object.keys(FILTER_NAMES),
  });
  return name in FILTER_NAMES;
};
