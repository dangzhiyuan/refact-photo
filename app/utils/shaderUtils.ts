import { Skia, SkShader, SkImage } from "@shopify/react-native-skia";
import { FilterType } from "../features/tools/filters/types";
import { LutImages, LutType } from "../assets/luts";
import { FILTER_TO_LUT } from "../features/tools/filters/shaders/FilterShader";

// 基础滤镜着色器代码
export const FILTER_SHADER = `
uniform shader image;
uniform float brightness;
uniform float contrast;
uniform float saturation;
uniform float temperature;
uniform float intensity;
uniform float hasLut;

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 applyFilter(vec4 color) {
    // 亮度调整
    vec3 rgb = color.rgb + vec3(brightness);
    
    // 对比度调整
    rgb = ((rgb - 0.5) * max(contrast + 1.0, 0.0)) + 0.5;
    
    // 饱和度调整
    vec3 hsv = rgb2hsv(rgb);
    hsv.y *= saturation;
    rgb = hsv2rgb(hsv);
    
    // 色温调整
    rgb.r += temperature;
    rgb.b -= temperature;
    
    return vec4(rgb, color.a);
}

vec4 main(vec2 coords) {
    vec4 color = image.eval(coords);
    
    // 应用滤镜
    color = applyFilter(color);
    
    return color;
}
`;

// 获取对应的LUT图片
export const getLutImage = (filterType: FilterType): SkImage | null => {
  if (!filterType || filterType === "normal") return null;

  const lutKey = FILTER_TO_LUT[filterType] as LutType;
  if (!lutKey) return null;

  const lutSource = LutImages[lutKey];
  // 这里需要将图片加载为SkImage
  // 简化示例，实际代码可能需要根据您的项目结构进行调整
  return Skia.Image.MakeImageFromEncoded(Skia.Data.fromBytes(lutSource));
};

// 创建滤镜着色器
export const createFilterShader = (
  image: any,
  filterType: FilterType,
  adjustments: any
): SkShader | null => {
  // 首先确保image是有效的
  if (!image) {
    console.error("图像无效");
    return null;
  }

  try {
    // 获取运行时效果
    const shader = Skia.RuntimeEffect.Make(FILTER_SHADER);
    if (!shader) {
      console.error("无法创建运行时效果");
      return null;
    }

    // 设置滤镜参数
    let filterAdjustments = { ...adjustments };

    // 根据滤镜类型设置预设参数
    switch (filterType) {
      case "light":
        filterAdjustments.brightness = 0.1;
        filterAdjustments.contrast = 0.1;
        filterAdjustments.saturation = 1.1;
        break;
      case "soft":
        filterAdjustments.contrast = -0.1;
        filterAdjustments.saturation = 0.9;
        break;
      case "flow":
        filterAdjustments.temperature = 0.1;
        filterAdjustments.saturation = 1.2;
        break;
      case "cool":
        filterAdjustments.temperature = -0.15;
        filterAdjustments.contrast = 0.15;
        break;
      case "warm":
        filterAdjustments.temperature = 0.15;
        filterAdjustments.brightness = 0.05;
        break;
      case "lowkey":
        filterAdjustments.saturation = 0.7;
        filterAdjustments.brightness = -0.05;
        break;
    }

    // 使用着色器创建函数
    return shader.makeShaderWithChildren(
      {
        brightness: filterAdjustments.brightness || 0,
        contrast: filterAdjustments.contrast || 0,
        saturation: filterAdjustments.saturation || 1,
        temperature: filterAdjustments.temperature || 0,
        intensity: filterAdjustments.intensity || 1,
        hasLut: 0,
      },
      [image] // 直接使用image对象，不尝试创建着色器
    );
  } catch (error) {
    console.error("创建着色器失败:", error);
    return null;
  }
};

// 根据滤镜类型返回特定的GLSL代码片段
function getFilterTypeCode(filterType: FilterType): string {
  switch (filterType) {
    case "warm":
      return "color.r *= 1.2; color.b *= 0.8;"; // 暖色调
    case "cold":
      return "color.r *= 0.8; color.b *= 1.2;"; // 冷色调
    case "bw":
      return "float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114)); color.rgb = vec3(gray);"; // 黑白
    case "sepia":
      return `
        float r = color.r * 0.393 + color.g * 0.769 + color.b * 0.189;
        float g = color.r * 0.349 + color.g * 0.686 + color.b * 0.168;
        float b = color.r * 0.272 + color.g * 0.534 + color.b * 0.131;
        color.rgb = vec3(r, g, b);
      `; // 怀旧
    case "vintage":
      return `
        color.r *= 1.1;
        color.g *= 0.9;
        color.b *= 0.8;
      `; // 复古
    case "fade":
      return "color.rgb = mix(color.rgb, vec3(0.8, 0.8, 0.8), 0.3);"; // 褪色
    case "magazine":
      return `
        color.r *= 1.3;
        color.g *= 0.9;
        color.b *= 0.7;
        color.rgb = mix(color.rgb, vec3(0.8, 0.7, 0.6), 0.2);
      `; // 日杂风格
    default:
      return ""; // 正常，不做额外处理
  }
}
