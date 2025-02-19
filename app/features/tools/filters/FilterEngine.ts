import { Asset } from "expo-asset";
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
  private previewCache: Map<string, SkImage> = new Map();
  private filterCache: Map<string, SkImage> = new Map();

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
      if (lutType === "normal" || !LutImages[lutType]) {
        console.log("No LUT needed for:", lutType);
        return null;
      }

      // 3. 使用 Asset 加载资源
      const asset = Asset.fromModule(LutImages[lutType]);
      await asset.downloadAsync();

      console.log("Asset loaded:", {
        localUri: asset.localUri,
        width: asset.width,
        height: asset.height,
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
        height: image.height(),
      });

      return image;
    } catch (error) {
      console.error("Error loading LUT:", {
        lutType,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  // 应用滤镜
  private generateCacheKey(
    sourceImage: SkImage,
    lutType: string,
    lutImage: SkImage,
    intensity: number
  ): string {
    return `${sourceImage.width()}_${sourceImage.height()}_${lutType}_${lutImage.width()}_${lutImage.height()}_${Math.round(
      intensity * 100
    )}`;
  }

  async applyFilter(
    sourceImage: SkImage,
    lutImage: SkImage,
    intensity: number,
    lutType: string
  ): Promise<SkImage | null> {
    console.log("Starting filter application:", {
      sourceSize: `${sourceImage.width()}x${sourceImage.height()}`,
      lutSize: `${lutImage.width()}x${lutImage.height()}`,
      lutType,
      intensity,
    });

    try {
      // 生成缓存键
      const cacheKey = this.generateCacheKey(
        sourceImage,
        lutType,
        lutImage,
        intensity
      );
      console.log("Cache key generated:", cacheKey);

      // 检查缓存
      if (this.filterCache.has(cacheKey)) {
        console.log("Using cached filter result for:", lutType);
        return this.filterCache.get(cacheKey)!;
      }

      console.log("Creating new surface");
      const surface = Skia.Surface.Make(
        sourceImage.width(),
        sourceImage.height()
      );
      if (!surface) {
        console.error("Failed to create surface");
        return null;
      }

      const canvas = surface.getCanvas();

      // 创建图片着色器
      console.log("Creating shaders");
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
      console.log("Creating LUT shader");
      const shader = LUT_SHADER.makeShaderWithChildren(
        [intensity],
        [sourceShader, lutShader]
      );
      if (!shader) {
        console.error("Failed to create shader");
        return null;
      }

      // 绘制
      console.log("Drawing with shader");
      const paint = Skia.Paint();
      paint.setShader(shader);
      canvas.drawRect(
        {
          x: 0,
          y: 0,
          width: sourceImage.width(),
          height: sourceImage.height(),
        },
        paint
      );

      // 获取结果
      console.log("Creating snapshot");
      const result = surface.makeImageSnapshot();
      surface.dispose();

      if (!result) {
        console.error("Failed to create snapshot");
        return null;
      }

      // 存入缓存
      console.log("Caching result");
      this.filterCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error("Filter application failed:", error);
      return null;
    }
  }

  // 预览滤镜效果
  async createPreview(
    sourceImage: SkImage,
    lutType: LutType,
    intensity: number
  ): Promise<SkImage | null> {
    try {
      // 如果是原图，直接返回源图片
      if (lutType === "normal") {
        return sourceImage;
      }

      // 加载 LUT 图片
      const lutImage = await this.loadLut(lutType);
      if (!lutImage) {
        console.warn("Failed to load LUT for preview:", lutType);
        return sourceImage;
      }

      // 应用滤镜
      const result = await this.applyFilter(
        sourceImage,
        lutImage,
        intensity,
        lutType
      );

      return result || sourceImage;
    } catch (error) {
      console.error("Failed to create preview:", error);
      return sourceImage;
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

  // 清理缓存方法
  clearCache() {
    this.filterCache.clear();
    this.lutCache.clear();
  }

  // 获取缓存大小
  getCacheSize() {
    return {
      lutCache: this.lutCache.size,
      filterCache: this.filterCache.size,
    };
  }

  // 清理特定滤镜的缓存
  clearFilterCache(lutType: string) {
    // 找到并删除包含特定 lutType 的缓存项
    for (const [key] of this.filterCache) {
      if (key.includes(lutType)) {
        this.filterCache.delete(key);
      }
    }
  }
}

export const filterEngine = FilterEngine.getInstance();
