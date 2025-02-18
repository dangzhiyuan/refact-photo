import { Skia } from "@shopify/react-native-skia";

// LUT 查找表着色器
export const LUT_SHADER = Skia.RuntimeEffect.Make(`
uniform float intensity;  // 必须放在最前面
uniform shader image;
uniform shader luts;

half4 main(float2 xy) {
  vec4 color = image.eval(xy);
  int r = int(color.r * 255.0 / 4);
  int g = int(color.g * 255.0 / 4);
  int b = int(color.b * 255.0 / 4);
  float lutX = float(int(mod(float(b), 8.0)) * 64 + r);
  float lutY = float(int((b / 8) * 64 + g));
  vec4 lutsColor = luts.eval(float2(lutX, lutY));
  return mix(color, lutsColor, intensity);
}
`)!;
