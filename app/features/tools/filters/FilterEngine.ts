import { Asset } from 'expo-asset';
import {
  SkImage,
  Skia,
  SkSurface,
  BlendMode,
  Shader,
  TileMode,
  FilterMode,
  MipmapMode,
  ImageShader,
} from "@shopify/react-native-skia";
import { LutType } from "../../../types/filter";
import { LutImages } from "../../../assets/luts";
import { Platform } from "react-native";
import { LUT_SHADER } from "./shaders/LutShader";

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
  async loadLut(lutType: LutType): Promise<SkImage | null> {
    try {
      // 1. 检查缓存
      if (this.lutCache.has(lutType)) {
        console.log("Using cached LUT:", lutType);
        return this.lutCache.get(lutType)!;
      }

      // 2. 如果是原图，直接返回 null
      if (lutType === 'normal' || !LutImages[lutType]) {
        console.log("No LUT needed for:", lutType);
        return null;
      }

      // 3. 使用 Asset 加载资源
      const asset = Asset.fromModule(LutImages[lutType]);
      await asset.downloadAsync();
      
      console.log("Asset loaded:", {
        localUri: asset.localUri,
        width: asset.width,
        height: asset.height
      });

      if (!asset.localUri) {
        throw new Error("Failed to get local URI for asset");
      }

      // 4. 从本地文件加载图片数据
      const response = await fetch(asset.localUri);
      const buffer = await response.arrayBuffer();
      const data = Skia.Data.fromBytes(new Uint8Array(buffer));
      
      // 5. 创建 Skia 图片
      const image = Skia.Image.MakeImageFromEncoded(data);

      if (!image) {
        throw new Error("Failed to decode image");
      }

      // 6. 存入缓存
      this.lutCache.set(lutType, image);
      console.log("Successfully loaded LUT:", {
        type: lutType,
        width: image.width(),
        height: image.height()
      });

      return image;
    } catch (error) {
      console.error("Error loading LUT:", {
        lutType,
        error: error instanceof Error ? error.message : String(error)
      });
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

      // 创建图片着色器
      const sourceShader = sourceImage.makeShaderOptions(
        TileMode.Decal,
        TileMode.Decal,
        FilterMode.Nearest,
        MipmapMode.None
      );
      const lutShader = lutImage.makeShaderOptions(
        TileMode.Decal,
        TileMode.Decal,
        FilterMode.Nearest,
        MipmapMode.None
      );

      // 创建 LUT 着色器
      const shader = LUT_SHADER.makeShaderWithChildren(
        [intensity],
        [sourceShader, lutShader]
      );

      // 绘制
      const paint = Skia.Paint();
      paint.setShader(shader);
      canvas.drawRect(
        { x: 0, y: 0, width: sourceImage.width(), height: sourceImage.height() },
        paint
      );

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
