# PhotoPixel 资源管理系统实现文档

## 1. 系统架构

### 1.1 核心功能模块

- 资源管理：统一管理各类资源的加载和缓存
- 资源库：管理内置和用户自定义资源
- 预加载系统：智能预加载常用资源
- 缓存管理：优化资源存储和访问

### 1.2 基础数据结构

```typescript
// 资源类型
type ResourceType = 'image' | 'font' | 'sticker' | 'template' | 'filter';

// 基础资源接口
interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  source: string;
  thumbnail?: string;
  metadata: ResourceMetadata;
  tags: string[];
  category: string;
  isBuiltin: boolean;
}

// 资源元数据
interface ResourceMetadata {
  author?: string;
  license?: string;
  version?: string;
  size: number;
  lastModified: number;
  format: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

// 资源库配置
interface ResourceLibraryConfig {
  maxCacheSize: number;
  preloadCategories: string[];
  compressionLevel: 'none' | 'low' | 'medium' | 'high';
  allowedFormats: {
    [key in ResourceType]: string[];
  };
  storageStrategy: 'indexeddb' | 'localstorage' | 'memory';
}

// 资源加载状态
interface ResourceLoadingState {
  isLoading: boolean;
  progress: number;
  error?: Error;
  retryCount: number;
}
```

## 2. 核心功能实现

### 2.1 资源管理器

```typescript
class ResourceManager {
  private resources: Map<string, Resource> = new Map();
  private loadingStates: Map<string, ResourceLoadingState> = new Map();
  private cache: ResourceCache;
  private config: ResourceLibraryConfig;

  constructor(config: ResourceLibraryConfig) {
    this.config = config;
    this.cache = new ResourceCache(config);
    this.initializeBuiltinResources();
  }

  // 加载资源
  async loadResource(id: string): Promise<Resource> {
    // 检查缓存
    const cached = this.cache.get(id);
    if (cached) return cached;

    // 检查加载状态
    if (this.isLoading(id)) {
      return this.waitForLoading(id);
    }

    const resource = this.resources.get(id);
    if (!resource) throw new Error(`Resource ${id} not found`);

    // 开始加载
    this.setLoadingState(id, {
      isLoading: true,
      progress: 0,
      retryCount: 0,
    });

    try {
      const loaded = await this.loadResourceContent(resource);
      this.cache.set(id, loaded);
      this.clearLoadingState(id);
      return loaded;
    } catch (error) {
      this.handleLoadError(id, error as Error);
      throw error;
    }
  }

  // 导入资源
  async importResource(
    file: File,
    type: ResourceType,
    metadata?: Partial<ResourceMetadata>,
  ): Promise<Resource> {
    // 验证文件格式
    this.validateFormat(file, type);

    // 创建资源记录
    const resource: Resource = {
      id: generateId(),
      type,
      name: file.name,
      source: await this.storeFile(file),
      metadata: {
        size: file.size,
        lastModified: file.lastModified,
        format: file.type,
        ...metadata,
      },
      tags: [],
      category: 'user',
      isBuiltin: false,
    };

    // 生成缩略图
    if (this.shouldGenerateThumbnail(type)) {
      resource.thumbnail = await this.generateThumbnail(file);
    }

    // 保存资源
    await this.saveResource(resource);
    this.resources.set(resource.id, resource);

    return resource;
  }

  // 预加载资源
  preloadResources(category: string): void {
    const resources = this.getResourcesByCategory(category);
    resources.forEach(resource => {
      if (this.shouldPreload(resource)) {
        this.loadResource(resource.id).catch(console.error);
      }
    });
  }

  // 清理资源
  async cleanupResources(): Promise<void> {
    const unusedResources = this.findUnusedResources();
    for (const resource of unusedResources) {
      await this.deleteResource(resource.id);
    }
    this.cache.cleanup();
  }
}
```

### 2.2 资源缓存管理器

```typescript
class ResourceCache {
  private cache: Map<string, CacheEntry> = new Map();
  private size: number = 0;
  private readonly config: ResourceLibraryConfig;

  // 添加到缓存
  set(id: string, resource: Resource): void {
    const size = this.calculateResourceSize(resource);

    // 检查缓存大小
    while (this.size + size > this.config.maxCacheSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(id, {
      resource,
      size,
      lastAccessed: Date.now(),
      accessCount: 0,
    });
    this.size += size;
  }

  // 获取缓存
  get(id: string): Resource | null {
    const entry = this.cache.get(id);
    if (!entry) return null;

    // 更新访问信息
    entry.lastAccessed = Date.now();
    entry.accessCount++;

    return entry.resource;
  }

  // 清理缓存
  cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24小时

    for (const [id, entry] of this.cache.entries()) {
      if (now - entry.lastAccessed > maxAge) {
        this.cache.delete(id);
        this.size -= entry.size;
      }
    }
  }

  // 驱逐最少使用的缓存
  private evictLeastRecentlyUsed(): void {
    let oldest: [string, CacheEntry] | null = null;
    for (const [id, entry] of this.cache.entries()) {
      if (!oldest || entry.lastAccessed < oldest[1].lastAccessed) {
        oldest = [id, entry];
      }
    }

    if (oldest) {
      this.cache.delete(oldest[0]);
      this.size -= oldest[1].size;
    }
  }
}
```

### 2.3 资源压缩优化

```typescript
class ResourceCompressor {
  private readonly config: ResourceLibraryConfig;

  // 压缩图片
  async compressImage(
    image: Blob,
    options?: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    },
  ): Promise<Blob> {
    const img = await createImageBitmap(image);
    const {width, height} = this.calculateDimensions(
      img.width,
      img.height,
      options,
    );

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d')!;

    // 绘制图片
    ctx.drawImage(img, 0, 0, width, height);

    // 导出压缩后的图片
    return canvas.convertToBlob({
      type: 'image/webp',
      quality: options?.quality || 0.8,
    });
  }

  // 优化字体
  async optimizeFont(font: ArrayBuffer): Promise<ArrayBuffer> {
    // 实现字体子集化
    // 移除未使用的字形
    // 压缩字体数据
    return font;
  }

  // 计算压缩后的尺寸
  private calculateDimensions(
    width: number,
    height: number,
    options?: {maxWidth?: number; maxHeight?: number},
  ): {width: number; height: number} {
    if (!options?.maxWidth && !options?.maxHeight) {
      return {width, height};
    }

    const ratio = width / height;
    let newWidth = width;
    let newHeight = height;

    if (options.maxWidth && width > options.maxWidth) {
      newWidth = options.maxWidth;
      newHeight = newWidth / ratio;
    }

    if (options.maxHeight && newHeight > options.maxHeight) {
      newHeight = options.maxHeight;
      newWidth = newHeight * ratio;
    }

    return {width: Math.round(newWidth), height: Math.round(newHeight)};
  }
}
```

## 3. 性能优化

### 3.1 预加载策略

```typescript
class PreloadStrategy {
  private readonly manager: ResourceManager;
  private preloadQueue: string[] = [];
  private isPreloading: boolean = false;

  // 添加预加载任务
  addToPreloadQueue(resourceIds: string[]): void {
    this.preloadQueue.push(...resourceIds);
    if (!this.isPreloading) {
      this.startPreloading();
    }
  }

  // 开始预加载
  private async startPreloading(): Promise<void> {
    this.isPreloading = true;

    while (this.preloadQueue.length > 0) {
      const id = this.preloadQueue.shift()!;
      try {
        await this.manager.loadResource(id);
      } catch (error) {
        console.error(`Failed to preload resource ${id}:`, error);
      }

      // 给其他任务机会执行
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    this.isPreloading = false;
  }

  // 预测用户可能需要的资源
  predictNeededResources(): string[] {
    // 基于用户行为分析
    // 基于资源使用频率
    // 基于资源关联性
    return [];
  }
}
```

### 3.2 内存管理

```typescript
class MemoryManager {
  private readonly MAX_MEMORY = 512 * 1024 * 1024; // 512MB
  private usedMemory: number = 0;

  // 检查内存使用
  checkMemoryUsage(): void {
    if (this.usedMemory > this.MAX_MEMORY) {
      this.reduceMemoryUsage();
    }
  }

  // 减少内存使用
  private async reduceMemoryUsage(): Promise<void> {
    // 清理未使用的缓存
    this.cache.cleanup();

    // 释放大型资源
    this.releaseUnusedResources();

    // 压缩内存中的资源
    await this.compressLoadedResources();
  }

  // 监控内存使用
  startMemoryMonitoring(): void {
    setInterval(() => {
      this.checkMemoryUsage();
    }, 60000); // 每分钟检查一次
  }
}
```

## 4. 用户界面集成

### 4.1 资源库面板

```typescript
const ResourceLibraryPanel: FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedType, setSelectedType] = useState<ResourceType>('image');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ResourceTypeSelector value={selectedType} onChange={setSelectedType} />
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="搜索资源..."
        />
      </View>

      <ResourceGrid
        resources={filterResources(resources, selectedType, searchQuery)}
        onSelect={handleResourceSelect}
        onImport={handleResourceImport}
      />

      <ResourceDetails
        resource={selectedResource}
        onEdit={handleResourceEdit}
        onDelete={handleResourceDelete}
      />
    </View>
  );
};
```

### 4.2 资源导入器

```typescript
const ResourceImporter: FC<{
  type: ResourceType;
  onImport: (resource: Resource) => void;
}> = ({type, onImport}) => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <View style={styles.container}>
      <DropZone
        accept={getAllowedFormats(type)}
        onDrop={handleFileDrop}
        multiple>
        <Text>拖放文件或点击选择</Text>
      </DropZone>

      {importing && (
        <ProgressBar progress={progress} status="正在导入资源..." />
      )}

      <ImportOptions type={type} />
    </View>
  );
};
```

## 5. 系统优势

1. **统一的资源管理**

   - 集中管理所有资源
   - 统一的加载接口
   - 资源类型扩展
   - 元数据管理

2. **高效的缓存系统**

   - 智能缓存策略
   - 内存优化
   - 自动清理
   - 预加载支持

3. **优秀的性能**

   - 资源压缩
   - 按需加载
   - 内存管理
   - 并发控制

4. **良好的用户体验**
   - 快速响应
   - 进度反馈
   - 错误处理
   - 导入导出

## 6. 注意事项

1. **资源管理**

   - 资源验证
   - 格式兼容
   - 版本控制
   - 许可证管理

2. **性能优化**

   - 内存使用
   - 加载性能
   - 缓存策略
   - 并发控制

3. **用户体验**

   - 加载提示
   - 错误反馈
   - 导入向导
   - 资源预览

4. **安全性**
   - 资源验证
   - 访问控制
   - 数据保护
   - 错误恢复
