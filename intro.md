# 图片编辑器项目文档

## 项目概述

这是一个基于 React Native 和 Skia 的移动端图片编辑器，支持图层管理、滤镜效果、文字添加等功能。项目使用 TypeScript 开发，采用模块化架构设计。

## 核心功能模块

### 1. 图层系统

#### 1.1 图层类型定义

每个图层都继承自 `BaseLayer`，包含基础属性：

```typescript
interface Transform {
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

interface BaseLayer {
  id: string; // 唯一标识
  name: string; // 图层名称
  type: LayerType; // 图层类型
  transform: Transform; // 变换信息
  opacity: number; // 透明度
  isVisible: boolean; // 可见性
  blendMode: BlendMode; // 混合模式
  zIndex: number; // 层级
}

// 图片图层
interface ImageLayer extends BaseLayer {
  type: "image";
  imageSource: SkImage; // Skia 图片对象
  filterType: LutType; // 滤镜类型
  filterIntensity: number; // 滤镜强度
  adjustments: Adjustments; // 图像调整
}

// 文字图层
interface TextLayer extends BaseLayer {
  type: "text";
  text: string; // 文本内容
  fontSize: number; // 字体大小
  color: string; // 文字颜色
  font?: string; // 字体
}
```

#### 1.2 图层状态管理详解

使用 Zustand 管理图层状态，实现响应式更新：

```typescript
interface LayerState {
  layers: Layer[];
  selectedLayerId: string | null;
  displayIntensity: number;

  // 图层操作
  addLayer: (layer: Layer) => void;
  removeLayer: (layerId: string) => void;
  duplicateLayer: (layerId: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;

  // 选择操作
  setSelectedLayer: (layerId: string | null) => void;

  // 排序操作
  reorderLayers: (fromIndex: number, toIndex: number) => void;
}

// 状态管理实现
export const useLayerStore = create<LayerState>((set) => ({
  layers: [],
  selectedLayerId: null,

  // 添加图层
  addLayer: (layer) =>
    set((state) => ({
      layers: [...state.layers, layer],
      selectedLayerId: layer.id,
    })),

  // 复制图层
  duplicateLayer: (layerId) =>
    set((state) => {
      const layer = state.layers.find((l) => l.id === layerId);
      if (!layer) return state;

      const newLayer = {
        ...layer,
        id: generateId(),
        name: `${layer.name} Copy`,
        transform: {
          ...layer.transform,
          position: {
            x: layer.transform.position.x + 20,
            y: layer.transform.position.y + 20,
          },
        },
      };

      return {
        layers: [...state.layers, newLayer],
        selectedLayerId: newLayer.id,
      };
    }),
}));
```

#### 1.3 图层渲染实现

使用 Skia Canvas 实现高性能渲染：

```typescript
// 图层工厂组件
const LayerFactory: FC<{ layer: Layer }> = ({ layer }) => {
  switch (layer.type) {
    case "image":
      return <FilterLayer layer={layer as ImageLayer} />;
    case "text":
      return <TextLayer layer={layer as TextLayer} />;
    default:
      return null;
  }
};

// 图片图层渲染
const FilterLayer: FC<{ layer: ImageLayer }> = ({ layer }) => {
  const { imageSource, transform, opacity, filterType, filterIntensity } =
    layer;

  return (
    <Group
      transform={[
        { translateX: transform.position.x },
        { translateY: transform.position.y },
        { scale: transform.scale },
        { rotate: transform.rotation },
      ]}
      opacity={opacity}
    >
      <Image image={imageSource} width={width} height={height} fit="contain" />
    </Group>
  );
};
```

#### 1.4 图层交互实现

手势系统实现：

```typescript
interface UseCanvasGestures {
  enabled: boolean;
  onTransformEnd?: (transform: Transform) => void;
}

export const useCanvasGestures = ({
  enabled,
  onTransformEnd,
}: UseCanvasGestures) => {
  const scale = useSharedValue(1);
  const offset = useSharedValue({ x: 0, y: 0 });

  const gesture = Gesture.Simultaneous(
    // 平移手势
    Gesture.Pan()
      .enabled(enabled)
      .onChange((e) => {
        offset.value = {
          x: offset.value.x + e.changeX,
          y: offset.value.y + e.changeY,
        };
      }),

    // 缩放手势
    Gesture.Pinch()
      .enabled(enabled)
      .onChange((e) => {
        scale.value = e.scale;
      })
  );

  return { gesture, scale, offset };
};
```

#### 1.5 图层优化策略

1. 渲染优化：

```typescript
// 使用 React.memo 优化重渲染
export const FilterLayer = React.memo(
  FilterLayerComponent,
  (prevProps, nextProps) => {
    const prevLayer = prevProps.layer;
    const nextLayer = nextProps.layer;

    return (
      prevLayer.imageSource === nextLayer.imageSource &&
      prevLayer.filterType === nextLayer.filterType &&
      prevLayer.filterIntensity === nextLayer.filterIntensity &&
      prevLayer.transform === nextLayer.transform
    );
  }
);
```

2. 缓存策略：

```typescript
// 图层缓存管理
class LayerCache {
  private cache: Map<string, SkImage> = new Map();

  // 存储处理后的图层
  set(id: string, image: SkImage) {
    this.cache.set(id, image);
  }

  // 获取缓存的图层
  get(id: string): SkImage | undefined {
    return this.cache.get(id);
  }

  // 清理缓存
  clear() {
    this.cache.clear();
  }
}
```

3. 异步处理：

```typescript
// 异步图层处理
const processLayer = async (layer: ImageLayer) => {
  if (layerCache.has(layer.id)) {
    return layerCache.get(layer.id);
  }

  const result = await processImage(layer);
  layerCache.set(layer.id, result);
  return result;
};
```

### 2. 滤镜系统详解

#### 2.1 LUT 滤镜原理

LUT (Look Up Table) 滤镜是一种高效的图像处理方法：

1. 基本原理：

- 使用 3D 颜色映射表
- 将原始颜色映射到目标颜色
- 支持复杂的颜色变换

2. 实现方式：

```glsl
// GLSL 着色器实现
precision highp float;

uniform sampler2D inputTexture;  // 输入图片
uniform sampler2D lutTexture;    // LUT 贴图
uniform float intensity;         // 滤镜强度

varying vec2 uv;

void main() {
    // 获取原始颜色
    vec4 color = texture2D(inputTexture, uv);

    // LUT 映射
    float blueColor = color.b * 63.0;
    vec2 quad1;
    quad1.y = floor(floor(blueColor) / 8.0);
    quad1.x = floor(blueColor) - (quad1.y * 8.0);

    vec2 quad2;
    quad2.y = floor(ceil(blueColor) / 8.0);
    quad2.x = ceil(blueColor) - (quad2.y * 8.0);

    // 计算最终颜色
    vec4 newColor = mix(
        texture2D(lutTexture, quad1),
        texture2D(lutTexture, quad2),
        fract(blueColor)
    );

    // 应用强度
    gl_FragColor = mix(color, newColor, intensity);
}
```

#### 2.2 滤镜引擎实现

1. 滤镜引擎类：

```typescript
class FilterEngine {
  private lutCache: Map<string, SkImage> = new Map();
  private filterCache: Map<string, SkImage> = new Map();

  // 加载并缓存 LUT
  async loadLut(type: LutType): Promise<SkImage | null> {
    // 检查缓存
    if (this.lutCache.has(type)) {
      return this.lutCache.get(type)!;
    }

    try {
      // 加载 LUT 图片
      const lutImage = await loadSkImage(LutImages[type]);
      this.lutCache.set(type, lutImage);
      return lutImage;
    } catch (error) {
      console.error("Failed to load LUT:", error);
      return null;
    }
  }

  // 应用滤镜效果
  async applyFilter(
    source: SkImage,
    lut: SkImage,
    intensity: number,
    type: LutType
  ): Promise<SkImage | null> {
    // 生成缓存键
    const cacheKey = `${type}_${intensity}_${source.uniqueId()}`;

    // 检查缓存
    if (this.filterCache.has(cacheKey)) {
      return this.filterCache.get(cacheKey)!;
    }

    try {
      // 创建着色器
      const shader = Skia.RuntimeEffect.Make(`
        uniform shader input;
        uniform shader lut;
        uniform float intensity;
        
        vec4 main(vec2 coord) {
          vec4 color = input.eval(coord);
          vec4 lutColor = lut.eval(coord);
          return mix(color, lutColor, intensity);
        }
      `);

      // 应用滤镜
      const filtered = await shader.makeImage({
        input: source,
        lut,
        intensity,
      });

      // 缓存结果
      this.filterCache.set(cacheKey, filtered);
      return filtered;
    } catch (error) {
      console.error("Failed to apply filter:", error);
      return null;
    }
  }

  // 清理缓存
  clearFilterCache(type?: LutType) {
    if (type) {
      // 清理特定滤镜的缓存
      for (const key of this.filterCache.keys()) {
        if (key.startsWith(type)) {
          this.filterCache.delete(key);
        }
      }
    } else {
      // 清理所有缓存
      this.filterCache.clear();
    }
  }
}
```

2. 滤镜预设配置：

```typescript
interface FilterConfig {
  name: string; // 滤镜名称
  lutType: LutType; // LUT 类型
  intensity: number; // 默认强度
}

export const FILTER_PRESETS: Record<LutType, FilterConfig> = {
  normal: { name: "原图", lutType: "normal", intensity: 1 },
  lut1: { name: "日系清新", lutType: "lut1", intensity: 0.5 },
  lut2: { name: "复古胶片", lutType: "lut2", intensity: 0.5 },
  // ...其他滤镜
};
```

#### 2.3 性能优化策略

1. 缓存优化：

```typescript
// 多级缓存策略
class FilterCacheManager {
  // LUT 缓存
  private lutCache = new Map<string, SkImage>();
  // 滤镜结果缓存
  private resultCache = new Map<string, SkImage>();
  // 着色器缓存
  private shaderCache = new Map<string, RuntimeEffect>();

  // LRU 缓存清理
  private cleanCache() {
    if (this.resultCache.size > 50) {
      const oldestKey = this.resultCache.keys().next().value;
      this.resultCache.delete(oldestKey);
    }
  }
}
```

2. 异步处理优化：

```typescript
// 异步滤镜处理队列
class FilterQueue {
  private queue: Array<FilterTask> = [];
  private processing = false;

  // 添加任务
  async addTask(task: FilterTask) {
    this.queue.push(task);
    if (!this.processing) {
      this.processQueue();
    }
  }

  // 处理队列
  private async processQueue() {
    this.processing = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      await this.processTask(task);
    }
    this.processing = false;
  }
}
```

3. 内存管理：

```typescript
// 资源释放
class ResourceManager {
  // 跟踪资源使用
  private resources = new WeakMap<SkImage, number>();

  // 释放未使用的资源
  cleanup() {
    for (const [image, count] of this.resources) {
      if (count === 0) {
        image.dispose();
      }
    }
  }
}
```

#### 2.4 滤镜应用流程

1. 用户交互：

```typescript
const handleFilterChange = async (type: LutType) => {
  // 开始加载指示
  setLoading(true);

  try {
    // 预加载 LUT
    const lutImage = await filterEngine.loadLut(type);
    if (!lutImage) throw new Error("Failed to load LUT");

    // 应用滤镜
    const result = await filterEngine.applyFilter(
      sourceImage,
      lutImage,
      intensity,
      type
    );

    // 更新图层
    updateLayer(layerId, {
      filterType: type,
      filterIntensity: intensity,
    });
  } catch (error) {
    console.error("Filter application failed:", error);
  } finally {
    setLoading(false);
  }
};
```

2. 强度调节：

```typescript
const handleIntensityChange = useCallback(
  debounce((value: number) => {
    if (!selectedLayer) return;

    // 更新显示值
    setDisplayIntensity(value);

    // 应用新强度
    updateLayer(selectedLayer.id, {
      filterIntensity: value,
      isUpdatingFilter: true,
    });
  }, 100),
  [selectedLayer]
);
```

## 项目扩展

### 1. 添加新滤镜

1. 在 `assets/luts` 添加 LUT 图片
2. 更新 `LutType` 类型定义
3. 在 `FILTER_PRESETS` 添加配置

```typescript
// 添加新滤镜
export type LutType = "normal" | "lut1" | ... | "newFilter";

export const FILTER_PRESETS: Record<LutType, FilterConfig> = {
  // ...
  newFilter: {
    name: "新滤镜",
    lutType: "newFilter",
    intensity: 0.5
  }
};
```

### 2. 添加新图层类型

1. 扩展 `LayerType`
2. 实现新的图层接口
3. 添加渲染逻辑
4. 更新图层工厂

```typescript
// 添加新图层类型
interface NewLayer extends BaseLayer {
  type: "new";
  // 新属性...
}

// 更新图层类型
type Layer = ImageLayer | TextLayer | ... | NewLayer;
```

## 技术栈

- React Native
- @shopify/react-native-skia
- Zustand
- TypeScript
- React Native Reanimated

## 最佳实践

1. 图层管理

- 使用唯一 ID
- 保持状态不可变性
- 实现图层缓存

2. 滤镜处理

- 异步加载资源
- 缓存处理结果
- 优化更新时机

3. 性能优化

- 使用 React.memo
- 实现选择性重渲染
- 优化事件处理

## 注意事项

1. 内存管理

- 及时清理缓存
- 释放未使用的资源
- 控制图层数量

2. 错误处理

- 资源加载失败
- 滤镜处理异常
- 状态更新错误

3. 类型安全

- 严格类型检查
- 避免类型断言
- 保持接口一致
