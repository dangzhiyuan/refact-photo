/**
 * 图像加载优化工具
 * 提供图像预加载、渐进式加载和缓存功能
 */

// 缓存存储
interface CacheEntry {
  data: string;
  timestamp: number;
  size: number;
}

/**
 * 内存缓存管理器
 * 管理一个有大小限制的LRU缓存
 */
class MemoryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private totalSize: number = 0;
  private readonly maxSize: number;
  private readonly maxAge: number;
  
  /**
   * 创建缓存管理器
   * @param maxSizeMB 最大缓存大小（MB）
   * @param maxAgeSec 最大缓存时间（秒）
   */
  constructor(maxSizeMB: number = 50, maxAgeSec: number = 300) {
    this.maxSize = maxSizeMB * 1024 * 1024; // 转换为字节
    this.maxAge = maxAgeSec * 1000; // 转换为毫秒
  }
  
  /**
   * 设置缓存
   */
  set(key: string, data: string): void {
    // 估算数据大小（base64字符串长度的3/4大致为实际大小）
    const size = Math.ceil((data.length * 3) / 4);
    
    // 如果单个项目超过缓存上限的一半，不缓存
    if (size > this.maxSize / 2) {
      console.warn(`图像太大，无法缓存: ${key}, 大小: ${(size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }
    
    // 检查是否需要清理空间
    if (this.totalSize + size > this.maxSize) {
      this.evict(size);
    }
    
    // 存储项目
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      size
    };
    
    this.cache.set(key, entry);
    this.totalSize += size;
  }
  
  /**
   * 获取缓存
   */
  get(key: string): string | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // 检查是否过期
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.delete(key);
      return null;
    }
    
    // 更新时间戳（LRU策略）
    entry.timestamp = Date.now();
    this.cache.set(key, entry);
    
    return entry.data;
  }
  
  /**
   * 删除缓存
   */
  delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.totalSize -= entry.size;
      this.cache.delete(key);
    }
  }
  
  /**
   * 清理缓存
   */
  evict(requiredSpace: number): void {
    // 按最近使用时间排序
    const entries = Array.from(this.cache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    );
    
    // 删除最旧的条目，直到有足够空间
    for (const [key, entry] of entries) {
      this.delete(key);
      
      if (this.maxSize - this.totalSize >= requiredSpace) {
        break;
      }
    }
  }
  
  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.totalSize = 0;
  }
  
  /**
   * 获取当前缓存大小
   */
  getCurrentSize(): number {
    return this.totalSize;
  }
  
  /**
   * 获取缓存使用百分比
   */
  getUsagePercentage(): number {
    return (this.totalSize / this.maxSize) * 100;
  }
}

// 全局缓存实例
const imageCache = new MemoryCache();

// 预加载队列
interface QueuedImage {
  uri: string;
  priority: number;
  retry?: number;
}

/**
 * 图像加载和预加载管理器
 */
export class ImageLoader {
  private static preloadQueue: QueuedImage[] = [];
  private static isProcessingQueue: boolean = false;
  private static maxConcurrentLoads: number = 2;
  private static currentLoads: number = 0;
  
  /**
   * 获取图像，如果已缓存则从缓存获取，否则加载
   * 
   * @param uri 图像URI
   * @returns 返回Promise，解析为图像数据
   */
  static async getImage(uri: string): Promise<string> {
    // 检查缓存
    const cachedImage = imageCache.get(uri);
    if (cachedImage) {
      return cachedImage;
    }
    
    // 加载图像
    try {
      const imageData = await this.loadImage(uri);
      
      // 缓存结果
      imageCache.set(uri, imageData);
      
      return imageData;
    } catch (error) {
      console.error(`加载图像失败: ${uri}`, error);
      throw error;
    }
  }
  
  /**
   * 加载图像
   * 
   * @param uri 图像URI
   * @returns 返回Promise，解析为图像数据
   */
  private static async loadImage(uri: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      fetch(uri)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });
  }
  
  /**
   * 添加图像到预加载队列
   * 
   * @param uri 图像URI
   * @param priority 优先级 (1-10，10为最高)
   */
  static preloadImage(uri: string, priority: number = 5): void {
    // 检查是否已在队列中
    const existingIndex = this.preloadQueue.findIndex(item => item.uri === uri);
    
    if (existingIndex >= 0) {
      // 更新优先级
      this.preloadQueue[existingIndex].priority = Math.max(
        this.preloadQueue[existingIndex].priority,
        priority
      );
    } else {
      // 添加到队列
      this.preloadQueue.push({ uri, priority });
      
      // 排序队列
      this.sortQueue();
      
      // 如果队列处理未启动，启动它
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    }
  }
  
  /**
   * 批量预加载图像
   * 
   * @param uris 图像URI数组
   * @param priority 优先级
   */
  static preloadImages(uris: string[], priority: number = 5): void {
    uris.forEach(uri => this.preloadImage(uri, priority));
  }
  
  /**
   * 按优先级排序队列
   */
  private static sortQueue(): void {
    this.preloadQueue.sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * 处理预加载队列
   */
  private static async processQueue(): Promise<void> {
    if (this.preloadQueue.length === 0 || this.isProcessingQueue) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    while (this.preloadQueue.length > 0) {
      // 检查当前并发加载数量
      if (this.currentLoads >= this.maxConcurrentLoads) {
        // 等待一段时间后再检查
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }
      
      // 获取队列中的下一个图像
      const item = this.preloadQueue.shift();
      if (!item) continue;
      
      // 增加当前加载计数
      this.currentLoads++;
      
      // 检查缓存
      if (imageCache.get(item.uri)) {
        this.currentLoads--;
        continue;
      }
      
      // 预加载图像
      this.loadImage(item.uri)
        .then(data => {
          // 缓存结果
          imageCache.set(item.uri, data);
        })
        .catch(error => {
          console.warn(`预加载图像失败: ${item.uri}`, error);
          
          // 如果需要重试
          const retryCount = (item.retry || 0) + 1;
          if (retryCount <= 3) {
            // 添加回队列，优先级降低
            this.preloadQueue.push({
              uri: item.uri,
              priority: Math.max(1, item.priority - 2),
              retry: retryCount
            });
            this.sortQueue();
          }
        })
        .finally(() => {
          // 减少当前加载计数
          this.currentLoads--;
        });
    }
    
    this.isProcessingQueue = false;
  }
  
  /**
   * 清除图像缓存
   */
  static clearCache(): void {
    imageCache.clear();
  }
  
  /**
   * 获取缓存使用情况
   */
  static getCacheUsage(): { size: number; percentage: number } {
    return {
      size: imageCache.getCurrentSize(),
      percentage: imageCache.getUsagePercentage()
    };
  }
}

/**
 * 渐进式图像加载器
 * 先加载低质量版本，然后加载高质量版本
 */
export class ProgressiveImageLoader {
  /**
   * 渐进式加载图像
   * 
   * @param uri 图像URI
   * @param lowQualityMultiplier 低质量图像的尺寸比例（0.1-0.5之间）
   * @param onLowQualityLoad 低质量图像加载完成回调
   * @param onHighQualityLoad 高质量图像加载完成回调
   */
  static async loadProgressively(
    uri: string,
    lowQualityMultiplier: number = 0.1,
    onLowQualityLoad?: (data: string) => void,
    onHighQualityLoad?: (data: string) => void
  ): Promise<string> {
    // 规范化比例
    const multiplier = Math.max(0.05, Math.min(0.5, lowQualityMultiplier));
    
    try {
      // 检查是否有缓存的高质量图像
      const cachedHighQuality = imageCache.get(uri);
      if (cachedHighQuality) {
        if (onHighQualityLoad) {
          onHighQualityLoad(cachedHighQuality);
        }
        return cachedHighQuality;
      }
      
      // 构建低质量图像URL（假设有图像处理服务）
      // 注意：这里的实现取决于您的后端或CDN如何支持图像尺寸调整
      // 这里使用一个假设的格式，实际使用时需要替换
      const lowQualityUri = `${uri}?width=${Math.floor(100 * multiplier)}`;
      
      // 尝试从缓存加载低质量图像
      let lowQualityData = imageCache.get(lowQualityUri);
      
      // 如果没有缓存，加载低质量图像
      if (!lowQualityData) {
        lowQualityData = await ImageLoader.getImage(lowQualityUri);
      }
      
      // 回调低质量图像
      if (onLowQualityLoad && lowQualityData) {
        onLowQualityLoad(lowQualityData);
      }
      
      // 加载高质量图像
      const highQualityData = await ImageLoader.getImage(uri);
      
      // 回调高质量图像
      if (onHighQualityLoad) {
        onHighQualityLoad(highQualityData);
      }
      
      return highQualityData;
    } catch (error) {
      console.error(`渐进式加载图像失败: ${uri}`, error);
      throw error;
    }
  }
} 