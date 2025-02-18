import {
  SkImage,
  Skia,
  SkSurface,
  BlendMode,
} from "@shopify/react-native-skia";
import { LutType } from "../../../types/filter";
import { LutImages } from "../../../assets/luts";

// 定义 LUT 着色器
const LUT_SHADER = Skia.RuntimeEffect.Make(`
  uniform shader image;
  uniform shader luts;
  uniform float intensity;

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

export interface FilterOptions {
  lutType?: LutType;
  intensity?: number;
}

class FilterEngine {
  private static instance: FilterEngine;
  private lutCache: Map<string, SkImage> = new Map();

  private constructor() {}

  static getInstance(): FilterEngine {
    if (!FilterEngine.instance) {
      FilterEngine.instance = new FilterEngine();
    }
    return FilterEngine.instance;
  }

  // 加载 LUT 图片
  async loadLut(type: LutType): Promise<SkImage | null> {
    if (this.lutCache.has(type)) {
      return this.lutCache.get(type)!;
    }

    try {
      const lutImage = await this.loadLutImage(type);
      if (lutImage) {
        this.lutCache.set(type, lutImage);
      }
      return lutImage;
    } catch (error) {
      console.error(`Failed to load LUT: ${type}`, error);
      return null;
    }
  }

  // 应用滤镜
  async applyFilter(
    sourceImage: SkImage,
    lutImage: SkImage,
    intensity: number = 1
  ): Promise<SkImage | null> {
    try {
      // 创建离屏渲染表面
      const surface = Skia.Surface.Make(
        sourceImage.width(),
        sourceImage.height()
      );
      if (!surface) return null;

      const canvas = surface.getCanvas();

      // 绘制源图片
      canvas.drawImage(sourceImage, 0, 0);

      // 创建 Paint 对象
      const paint = Skia.Paint();

      // 设置混合模式 - 使用正确的枚举值
      paint.setBlendMode(BlendMode.SrcOver);

      // 绘制 LUT 图片
      canvas.drawImage(lutImage, 0, 0, paint);

      // 设置不透明度
      paint.setAlphaf(intensity);

      // 获取结果
      const result = surface.makeImageSnapshot();
      surface.dispose();

      return result;
    } catch (error) {
      console.error("Failed to apply filter:", error);
      return null;
    }
  }

  // 预览滤镜效果
  async createPreview(
    sourceImage: SkImage,
    lutImage: SkImage,
    intensity: number,
    size: { width: number; height: number }
  ): Promise<SkImage | null> {
    try {
      // 创建缩略图
      const thumbnail = await this.createThumbnail(sourceImage, size);
      if (!thumbnail) return null;

      // 应用滤镜
      return this.applyFilter(thumbnail, lutImage, intensity);
    } catch (error) {
      console.error("Failed to create preview:", error);
      return null;
    }
  }

  // 私有辅助方法
  private async loadLutImage(type: LutType): Promise<SkImage | null> {
    try {
      // 如果是原图，直接返回 null
      if (type === "normal") return null;

      const lutResource = LutImages[type];
      if (!lutResource) return null;

      // 使用 Skia 的 Data API
      const response = await fetch(lutResource);
      const buffer = await response.arrayBuffer();
      const data = Skia.Data.fromBytes(new Uint8Array(buffer));

      return Skia.Image.MakeImageFromEncoded(data);
    } catch (error) {
      console.error("Failed to load LUT image:", error);
      return null;
    }
  }

  private createFilterSurface(width: number, height: number): SkSurface | null {
    try {
      return Skia.Surface.Make(width, height);
    } catch (error) {
      console.error("Failed to create surface:", error);
      return null;
    }
  }

  private async createThumbnail(
    sourceImage: SkImage,
    size: { width: number; height: number }
  ): Promise<SkImage | null> {
    try {
      // 计算缩放比例
      const scale = Math.min(
        size.width / sourceImage.width(),
        size.height / sourceImage.height()
      );

      // 创建缩略图表面
      const surface = Skia.Surface.Make(size.width, size.height);
      if (!surface) return null;

      // 绘制缩略图
      const canvas = surface.getCanvas();
      canvas.scale(scale, scale);
      canvas.drawImage(sourceImage, 0, 0);

      // 获取结果
      const thumbnail = surface.makeImageSnapshot();
      surface.dispose();

      return thumbnail;
    } catch (error) {
      console.error("Failed to create thumbnail:", error);
      return null;
    }
  }
}

export const filterEngine = FilterEngine.getInstance();
