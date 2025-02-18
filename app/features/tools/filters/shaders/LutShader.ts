import { Skia } from "@shopify/react-native-skia";

// LUT 查找表着色器
export const LUT_SHADER = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform shader lutTexture;
uniform float intensity;

vec4 main(vec2 xy) {
  vec4 color = image.eval(xy);
  
  // 将颜色值映射到 LUT 坐标
  float cell = 64.0;
  float blueColor = color.b * 255.0;
  
  float row = floor(blueColor / 8.0);
  float col = mod(blueColor, 8.0);
  
  float redColor = color.r * 255.0;
  float greenColor = color.g * 255.0;
  
  // 计算 LUT 查找坐标
  vec2 lutCoord;
  lutCoord.x = (col * cell + redColor) / 512.0;
  lutCoord.y = (row * cell + greenColor) / 512.0;
  
  // 获取 LUT 颜色并混合
  vec4 lutColor = lutTexture.eval(lutCoord);
  return mix(color, lutColor, intensity);
}
`)!;
