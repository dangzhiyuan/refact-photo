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
import { LutType } from "../../../assets/luts";
import { LUT_SHADER } from "./shaders/LutShader";
import { getLutImage } from "../../../assets/luts";

export interface FilterOptions {
  lutType?: LutType;
  intensity?: number;
}

class FilterEngine {
  private static instance: FilterEngine;
  private lutCache = new Map<string, SkImage>();
  private previewCache: Map<string, SkImage> = new Map();
  private filterCache: Map<string, SkImage> = new Map();
  private loadingLuts = new Map<string, Promise<SkImage | null>>();
  private processingQueue: {
    source: SkImage;
    type: LutType;
    intensity: number;
    resolve: (value: SkImage | null) => void;
  }[] = [];
  private maxCacheSize: number = 50;

  private constructor() {
    this.maxCacheSize = 50;
  }

  static getInstance(): FilterEngine {
    if (!FilterEngine.instance) {
      FilterEngine.instance = new FilterEngine();
    }
    return FilterEngine.instance;
  }

  // 加载 LUT 图片
  async loadLut(type: LutType): Promise<SkImage | null> {
    // 1. 检查缓存
    if (this.lutCache.has(type)) {
      return this.lutCache.get(type)!;
    }

    // 2. 检查是否正在加载
    if (this.loadingLuts.has(type)) {
      const loadingPromise = this.loadingLuts.get(type);
      return loadingPromise ? loadingPromise : null;
    }

    // 3. 开始新的加载
    const loadPromise = this.loadLutImage(type).then((image) => {
      if (image) {
        this.lutCache.set(type, image);
      }
      this.loadingLuts.delete(type);
      return image;
    });

    this.loadingLuts.set(type, loadPromise);
    return loadPromise;
  }

  // 应用滤镜
  async applyFilter(
    sourceImage: SkImage,
    lutImage: SkImage,
    intensity: number,
    lutType: string
  ): Promise<SkImage | null> {
    try {
      // 生成缓存键
      const cacheKey = `${sourceImage.width()}_${sourceImage.height()}_${lutType}_${Math.round(intensity * 100)}`;
      
      // 检查缓存
      if (this.filterCache.has(cacheKey)) {
        return this.filterCache.get(cacheKey)!;
      }

      // 检查输入图片
      if (!sourceImage || !lutImage) {
        console.error("Invalid input images");
        return null;
      }

      // 检查 LUT 尺寸，固定512
      if (lutImage.width() !== 512 || lutImage.height() !== 512) {
        console.error("Invalid LUT dimensions:", {
          width: lutImage.width(),
          height: lutImage.height()
        });
        return null;
      }

      // 创建与源图片相同尺寸的 surface
      const surface = Skia.Surface.Make(
        sourceImage.width(),
        sourceImage.height()
      );
      if (!surface) return null;

      const canvas = surface.getCanvas();

      // 创建着色器
      const sourceShader = sourceImage.makeShaderOptions(
        TileMode.Decal,  //避免边缘重复
        TileMode.Decal,
        FilterMode.Linear,
        MipmapMode.None
      );

      const lutShader = lutImage.makeShaderOptions(
        TileMode.Decal,
        TileMode.Decal,
        FilterMode.Linear,
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
        {
          x: 0,
          y: 0,
          width: sourceImage.width(),
          height: sourceImage.height(),
        },
        paint
      );

      // 获取结果并缓存
      const result = surface.makeImageSnapshot();
      surface.dispose();

      // 存入缓存
      this.filterCache.set(cacheKey, result);
      
      // 清理过期缓存
      this.cleanupCache();

      return result;
    } catch (error) {
      console.error("Filter application failed:", error);
      return null;
    }
  }

  // 预览滤镜效果，有点卡
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

      const lutImage = await this.loadLut(lutType);
      if (!lutImage) {
        console.warn("Failed to load LUT for preview:", lutType);
        return sourceImage;
      }
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

  private async loadLutImage(type: LutType): Promise<SkImage | null> {
    try {
      if (type === "normal") return null;

      const lutResource = getLutImage(type);
      if (!lutResource) return null;

      // 使用 Asset 加载资源，异步的
      const asset = await Asset.loadAsync(lutResource);
      if (!asset || !asset[0].localUri) {
        throw new Error("Failed to load LUT asset");
      }

      // 检查图片尺寸
      console.log("Loading LUT:", {
        type,
        width: asset[0].width,
        height: asset[0].height
      });

      // 从本地 URI 获取图片数据
      const response = await fetch(asset[0].localUri);
      const buffer = await response.arrayBuffer();
      const data = Skia.Data.fromBytes(new Uint8Array(buffer));
      const image = Skia.Image.MakeImageFromEncoded(data);

      if (!image) {
        throw new Error("Failed to decode LUT image");
      }

      // 再次检查加载后的图片尺寸
      console.log("Loaded LUT dimensions:", {
        width: image.width(),
        height: image.height()
      });

      return image;
    } catch (error) {
      console.error("Failed to load LUT image:", error);
      return null;
    }
  }

  // private createFilterSurface(width: number, height: number): SkSurface | null {
  //   try {
  //     return Skia.Surface.Make(width, height);
  //   } catch (error) {
  //     console.error("Failed to create surface:", error);
  //     return null;
  //   }
  // }

  // private async createThumbnail(
  //   sourceImage: SkImage,
  //   size: { width: number; height: number }
  // ): Promise<SkImage | null> {
  //   try {
  //     // 计算缩放比例
  //     const scale = Math.min(
  //       size.width / sourceImage.width(),
  //       size.height / sourceImage.height()
  //     );

  //     // 创建缩略图表面
  //     const surface = Skia.Surface.Make(size.width, size.height);
  //     if (!surface) return null;

  //     // 绘制缩略图
  //     const canvas = surface.getCanvas();
  //     canvas.scale(scale, scale);
  //     canvas.drawImage(sourceImage, 0, 0);

  //     // 获取结果
  //     const thumbnail = surface.makeImageSnapshot();
  //     surface.dispose();

  //     return thumbnail;
  //   } catch (error) {
  //     console.error("Failed to create thumbnail:", error);
  //     return null;
  //   }
  // }

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

  async getOrProcessImage(
    source: SkImage,
    type: LutType,
    intensity: number
  ): Promise<SkImage | null> {
    // 生成缓存键
    const cacheKey = `${source.width()}_${source.height()}_${type}_${Math.round(intensity * 100)}`;

    // 1. 检查结果缓存
    const cachedResult = this.filterCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // 2. 预加载 LUT
    const lutImage = await this.loadLut(type);
    if (!lutImage) return null;

    // 3. 批量处理优化
    if (this.processingQueue.length > 0) {
      return new Promise((resolve) => {
        this.processingQueue.push({
          source,
          type,
          intensity,
          resolve,
        });
      });
    }

    // 4. 处理并缓存结果
    const result = await this.applyFilter(source, lutImage, intensity, type);
    if (result) {
      this.filterCache.set(cacheKey, result);
      this.cleanupCache();
    }

    return result;
  }

  // 内存管理
  private cleanupCache() {
    if (this.filterCache.size > this.maxCacheSize) {
      // 删除最早的缓存项
      const oldestKey = Array.from(this.filterCache.keys())[0];
      this.filterCache.delete(oldestKey);
    }
  }

  // 允许外部配置缓存大小
  setMaxCacheSize(size: number) {
    this.maxCacheSize = size;
    this.cleanupCache(); // 立即清理超出的缓存
  }
}

export const filterEngine = FilterEngine.getInstance();
