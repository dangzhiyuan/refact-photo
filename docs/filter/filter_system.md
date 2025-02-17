# PhotoPixel 滤镜系统实现文档

## 1. 系统架构

### 1.1 核心功能模块

- 滤镜引擎：处理滤镜效果的核心逻辑
- 着色器管理：统一管理和复用着色器程序
- 预览系统：实时预览和缓存管理
- 性能优化：GPU 加速和内存管理

### 1.2 基础数据结构

```typescript
// 滤镜图层
interface FilterLayer extends Layer {
  type: 'filter';
  content: {
    sourceImage: SkImage;
    filterState: FilterState;
    preview?: SkImage;
  };
}

// 滤镜状态
interface FilterState {
  filterId: string;
  intensity: number; // 0-1
  params: {
    [key: string]: number;
  };
}

// 滤镜定义
interface FilterDefinition {
  id: string;
  name: string;
  shader: RuntimeEffect;
  defaultParams: {
    [key: string]: number;
  };
  thumbnail?: string;
}
```

## 2. 核心功能实现

### 2.1 滤镜引擎

```typescript
class FilterEngine {
  private filters: Map<string, FilterDefinition> = new Map();

  // 注册滤镜
  registerFilter(filter: FilterDefinition) {
    this.filters.set(filter.id, filter);
  }

  // 应用滤镜
  applyFilter(
    sourceImage: SkImage,
    filterId: string,
    intensity: number,
    params: Record<string, number>,
  ): SkImage {
    const filter = this.filters.get(filterId);
    if (!filter) throw new Error(`Filter ${filterId} not found`);

    const surface = SkSurface.Make(sourceImage.width(), sourceImage.height());
    const canvas = surface.getCanvas();

    // 创建着色器
    const shader = filter.shader.makeShader({
      source: sourceImage,
      intensity,
      ...params,
    });

    // 应用着色器
    canvas.drawWithShader(shader);

    return surface.makeImageSnapshot();
  }

  // 混合多个滤镜
  blendFilters(
    sourceImage: SkImage,
    filters: Array<{
      id: string;
      intensity: number;
      params: Record<string, number>;
    }>,
  ): SkImage {
    let result = sourceImage;

    for (const filter of filters) {
      result = this.applyFilter(
        result,
        filter.id,
        filter.intensity,
        filter.params,
      );
    }

    return result;
  }
}
```

### 2.2 着色器实现

```typescript
// 1. 基础调整滤镜
const basicAdjustmentFilter = Skia.RuntimeEffect.Make(`
  uniform shader source;
  uniform float intensity;
  uniform float brightness;
  uniform float contrast;
  uniform float saturation;
  
  vec4 main(vec2 coord) {
    vec4 color = source.eval(coord);
    
    // 亮度调整
    color.rgb += brightness * intensity;
    
    // 对比度调整
    color.rgb = (color.rgb - 0.5) * (1.0 + contrast * intensity) + 0.5;
    
    // 饱和度调整
    float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    color.rgb = mix(vec3(luminance), color.rgb, 1.0 + saturation * intensity);
    
    return color;
  }
`)!;

// 2. 复古滤镜
const vintageFilter = Skia.RuntimeEffect.Make(`
  uniform shader source;
  uniform float intensity;
  
  vec4 main(vec2 coord) {
    vec4 color = source.eval(coord);
    
    // 调整色调
    vec3 sepia = vec3(
      dot(color.rgb, vec3(0.393, 0.769, 0.189)),
      dot(color.rgb, vec3(0.349, 0.686, 0.168)),
      dot(color.rgb, vec3(0.272, 0.534, 0.131))
    );
    
    // 混合原始颜色和复古效果
    color.rgb = mix(color.rgb, sepia, intensity);
    
    return color;
  }
`)!;

// 3. 渐变映射滤镜
const gradientMappingFilter = Skia.RuntimeEffect.Make(`
  uniform shader source;
  uniform shader gradient;
  uniform float intensity;
  
  vec4 main(vec2 coord) {
    vec4 color = source.eval(coord);
    float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    
    // 使用亮度值在渐变中采样
    vec4 gradientColor = gradient.eval(vec2(luminance, 0.5));
    
    // 混合原始颜色和渐变映射
    return mix(color, gradientColor, intensity);
  }
`)!;
```

### 2.3 预览生成

```typescript
class FilterPreviewGenerator {
  private previewSize = 300;
  private previewCache = new Map<string, SkImage>();

  // 生成预览
  async generatePreview(
    layer: FilterLayer,
    filterId: string,
    intensity: number,
  ): Promise<SkImage> {
    const cacheKey = this.generateCacheKey(layer, filterId, intensity);

    if (this.previewCache.has(cacheKey)) {
      return this.previewCache.get(cacheKey)!;
    }

    // 创建缩略图
    const thumbnail = await this.createThumbnail(
      layer.content.sourceImage,
      this.previewSize,
    );

    // 应用滤镜
    const preview = filterEngine.applyFilter(
      thumbnail,
      filterId,
      intensity,
      layer.content.filterState.params,
    );

    this.previewCache.set(cacheKey, preview);
    return preview;
  }

  // 清理缓存
  clearCache() {
    this.previewCache.clear();
  }
}
```

## 3. 性能优化

### 3.1 GPU 加速

```typescript
class GPUOptimizer {
  // 检查 GPU 能力
  checkGPUCapabilities(): GPUTier {
    // 检查设备 GPU 性能等级
    return getGPUTier();
  }

  // 优化着色器参数
  optimizeShaderParams(params: ShaderParams, gpuTier: GPUTier): ShaderParams {
    switch (gpuTier) {
      case GPUTier.HIGH:
        return params;
      case GPUTier.MEDIUM:
        return this.reduceShaderComplexity(params);
      case GPUTier.LOW:
        return this.useSimplifiedShader(params);
      default:
        return this.fallbackToCPU(params);
    }
  }

  // 根据 GPU 性能选择预览质量
  selectPreviewQuality(gpuTier: GPUTier): number {
    switch (gpuTier) {
      case GPUTier.HIGH:
        return 1.0;
      case GPUTier.MEDIUM:
        return 0.75;
      case GPUTier.LOW:
        return 0.5;
      default:
        return 0.25;
    }
  }
}
```

### 3.2 内存管理

```typescript
class FilterMemoryManager {
  private maxCacheSize = 50 * 1024 * 1024; // 50MB
  private currentCacheSize = 0;

  // 添加到缓存
  addToCache(key: string, image: SkImage) {
    const imageSize = image.width() * image.height() * 4;

    // 检查缓存大小
    while (this.currentCacheSize + imageSize > this.maxCacheSize) {
      this.evictOldestCache();
    }

    this.currentCacheSize += imageSize;
    this.cache.set(key, {
      image,
      size: imageSize,
      timestamp: Date.now(),
    });
  }

  // 清理过期缓存
  cleanupCache() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > 5 * 60 * 1000) {
        // 5分钟过期
        this.cache.delete(key);
        this.currentCacheSize -= entry.size;
      }
    }
  }
}
```

## 4. 用户界面实现

### 4.1 滤镜选择器

```typescript
const FilterSelector: FC<{
  onSelect: (filterId: string) => void;
}> = ({onSelect}) => {
  const filters = useFilters();

  return (
    <ScrollView horizontal>
      {filters.map(filter => (
        <TouchableOpacity key={filter.id} onPress={() => onSelect(filter.id)}>
          <View style={styles.filterItem}>
            <FilterThumbnail
              source={filter.thumbnail}
              style={styles.thumbnail}
            />
            <Text style={styles.filterName}>{filter.name}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
```

### 4.2 强度调节器

```typescript
const IntensitySlider: FC<{
  value: number;
  onChange: (value: number) => void;
}> = ({value, onChange}) => {
  return (
    <View style={styles.sliderContainer}>
      <Text style={styles.label}>强度</Text>
      <Slider
        value={value}
        onValueChange={onChange}
        minimumValue={0}
        maximumValue={1}
        step={0.01}
      />
      <Text style={styles.value}>{Math.round(value * 100)}%</Text>
    </View>
  );
};
```

## 5. 系统优势

1. **高性能处理**

   - GPU 加速支持
   - 智能缓存管理
   - 优化的着色器实现
   - 自适应预览质量

2. **丰富的滤镜效果**

   - 基础图像调整
   - 艺术风格滤镜
   - 渐变映射
   - 自定义滤镜支持

3. **优秀的用户体验**

   - 实时预览
   - 平滑的强度调节
   - 直观的滤镜选择
   - 性能自适应

4. **可扩展性**
   - 模块化设计
   - 自定义着色器支持
   - 滤镜组合能力
   - 参数自定义

## 6. 注意事项

1. **性能考虑**

   - 监控 GPU 使用
   - 优化着色器复杂度
   - 管理内存使用
   - 控制预览质量

2. **兼容性**

   - 设备适配
   - GPU 能力检测
   - 降级处理
   - 错误恢复

3. **用户体验**

   - 加载状态提示
   - 性能监控
   - 错误提示
   - 操作响应时间

4. **资源管理**
   - 着色器编译优化
   - 纹理资源管理
   - 缓存策略
   - 内存释放
