import { Skia } from "@shopify/react-native-skia";

export const ADJUSTMENT_SHADER = Skia.RuntimeEffect.Make(`
  uniform shader image;
  uniform float brightness;
  uniform float contrast;
  uniform float saturation;
  uniform float temperature;

  half4 main(float2 xy) {
    vec4 color = image.eval(xy);
    vec3 rgb = color.rgb;
    
    // 亮度调整
    rgb = rgb + vec3(brightness);
    
    // 对比度调整
    rgb = mix(vec3(0.5), rgb, contrast + 1.0);
    
    // 饱和度调整
    float gray = dot(rgb, vec3(0.299, 0.587, 0.114));
    rgb = mix(vec3(gray), rgb, saturation);
    
    // 色温调整
    rgb += vec3(temperature, 0.0, -temperature);
    
    // 确保颜色值在有效范围内
    rgb = clamp(rgb, 0.0, 1.0);
    
    return vec4(rgb, color.a);
  }
`)!; 