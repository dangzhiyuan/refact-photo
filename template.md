# PhotoPixel 模板功能移植详细计划

## 1. 功能概述

### 1.1 现有功能分析
PhotoPixel 的模板系统包含以下核心功能：
- 图层组合模板：多图层叠加效果
- 蒙皮模板：应用蒙皮效果
- 日光风络模板：光效处理
- 景深模板：虚化效果
- 纹理模板：添加纹理效果
- 裁剪模板：黑白底裁剪

### 1.2 技术栈对比
```typescript
// PhotoPixel
{
  "@shopify/react-native-skia": "^0.1.x",
  "react-native-reanimated": "^2.x",
  "react-native-gesture-handler": "^2.x",
  "redux": "^4.x"
}

// refact-photo
{
  "@shopify/react-native-skia": "1.5.0",
  "react-native-gesture-handler": "^2.20.2",
  "react-native-reanimated": "^3.16.7",
  "zustand": "^5.0.3"
}
```

## 2. 架构设计

### 2.1 目录结构
```
app/features/template/
├── components/
│   ├── TemplateCanvas.tsx     // 模板渲染画布
│   ├── TemplateList.tsx       // 模板列表展示
│   ├── TemplatePreview.tsx    // 模板预览组件
│   ├── TemplateControls.tsx   // 模板参数控制
│   └── TemplateToolbar.tsx    // 模板工具栏
├── templates/
│   ├── LayerCombine/
│   │   ├── index.tsx         // 图层组合模板
│   │   └── utils.ts          // 工具函数
│   ├── Skin/
│   │   ├── index.tsx         // 蒙皮模板
│   │   └── utils.ts          // 工具函数
│   ├── Sunshine/
│   │   ├── index.tsx         // 日光模板
│   │   └── utils.ts          // 工具函数
│   └── Depth/
│       ├── index.tsx         // 景深模板
│       └── utils.ts          // 工具函数
├── store/
│   ├── useTemplateStore.ts   // 模板状态管理
│   └── useTemplateCache.ts   // 资源缓存管理
├── hooks/
│   ├── useTemplateEffect.ts  // 模板效果钩子
│   └── useTemplateGesture.ts // 模板手势钩子
└── types/
    ├── template.ts           // 基础类型定义
    ├── assets.ts            // 资源类型定义
    └── effects.ts           // 效果类型定义
```

### 2.2 核心类型定义
```typescript
// types/template.ts

export enum TemplateType {
  LayerCombine = 'layer_combine',
  Skin = 'skin',
  Sunshine = 'sunshine',
  Depth = 'depth',
  Texture = 'texture',
  Clip = 'clip'
}

export interface TemplateAsset {
  id: string;
  type: TemplateType;
  name: string;
  thumbnail: string;
  category: string;
  resources: {
    primary: string;
    mask?: string;
    overlay?: string;
    texture?: string;
  };
  defaultParams: TemplateParams;
}

export interface TemplateParams {
  opacity: number;
  blendMode: SkBlendMode;
  intensity: number;
  scale: number;
  rotation: number;
  position: { x: number; y: number };
}

export interface TemplateState {
  selectedTemplate: TemplateAsset | null;
  templates: TemplateAsset[];
  isTemplateMode: boolean;
  params: TemplateParams;
  history: TemplateHistoryItem[];
}
```

### 2.3 状态管理
```typescript
// store/useTemplateStore.ts

interface TemplateStore extends TemplateState {
  // 模板选择
  selectTemplate: (template: TemplateAsset | null) => void;
  // 加载模板
  loadTemplates: (templates: TemplateAsset[]) => void;
  // 更新参数
  updateParams: (params: Partial<TemplateParams>) => void;
  // 重置参数
  resetParams: () => void;
  // 撤销/重做
  undo: () => void;
  redo: () => void;
  // 应用模板
  applyTemplate: () => void;
  // 取消模板
  cancelTemplate: () => void;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  // ... 状态初始化
  // ... 方法实现
}));
```

## 3. 核心组件实现

### 3.1 模板画布
```typescript
// components/TemplateCanvas.tsx

export const TemplateCanvas: FC<{
  sourceImage: SkImage;
  width: number;
  height: number;
}> = ({ sourceImage, width, height }) => {
  const { selectedTemplate, params } = useTemplateStore();
  const { applyTemplateEffect } = useTemplateEffect();

  // 处理模板效果
  const processedImage = useMemo(() => {
    if (!selectedTemplate) return sourceImage;
    return applyTemplateEffect(sourceImage, selectedTemplate, params);
  }, [sourceImage, selectedTemplate, params]);

  return (
    <Canvas style={{ width, height }}>
      <Group>
        <Image image={processedImage} width={width} height={height} />
        <TemplateOverlay template={selectedTemplate} params={params} />
      </Group>
    </Canvas>
  );
};
```

### 3.2 模板效果处理
```typescript
// hooks/useTemplateEffect.ts

export const useTemplateEffect = () => {
  const applyTemplateEffect = useCallback((
    source: SkImage,
    template: TemplateAsset,
    params: TemplateParams
  ) => {
    switch (template.type) {
      case TemplateType.LayerCombine:
        return applyLayerCombine(source, template, params);
      case TemplateType.Skin:
        return applySkinEffect(source, template, params);
      case TemplateType.Sunshine:
        return applySunshineEffect(source, template, params);
      case TemplateType.Depth:
        return applyDepthEffect(source, template, params);
      default:
        return source;
    }
  }, []);

  return { applyTemplateEffect };
};
```

### 3.3 资源管理
```typescript
// store/useTemplateCache.ts

interface TemplateCacheStore {
  cache: Map<string, SkImage>;
  preloadTemplate: (template: TemplateAsset) => Promise<void>;
  clearCache: () => void;
}

export const useTemplateCache = create<TemplateCacheStore>((set, get) => ({
  cache: new Map(),

  preloadTemplate: async (template) => {
    const { cache } = get();
    if (cache.has(template.id)) return;

    // 预加载资源
    const resources = await Promise.all([
      loadImage(template.resources.primary),
      template.resources.mask && loadImage(template.resources.mask),
      template.resources.overlay && loadImage(template.resources.overlay),
    ]);

    set((state) => {
      const newCache = new Map(state.cache);
      resources.forEach((resource, index) => {
        if (resource) {
          newCache.set(`${template.id}_${index}`, resource);
        }
      });
      return { cache: newCache };
    });
  },

  clearCache: () => set({ cache: new Map() }),
}));
```

## 4. 性能优化

### 4.1 图像处理优化
- 使用 `useMemo` 缓存处理结果
- 实现渐进式加载
- 使用 `requestAnimationFrame` 处理动画效果

```typescript
const processedImage = useMemo(() => {
  if (!sourceImage || !template) return null;
  return processWithWorker(sourceImage, template, params);
}, [sourceImage, template, params]);
```

### 4.2 资源管理优化
- 实现资源预加载
- 使用 LRU 缓存策略
- 自动清理未使用资源

```typescript
const preloadTemplates = async (templates: TemplateAsset[]) => {
  const preloadPromises = templates.map(template => 
    preloadTemplate(template)
  );
  await Promise.all(preloadPromises);
};
```

### 4.3 渲染优化
- 使用 `shouldComponentUpdate` 优化重渲染
- 实现虚拟列表
- 优化图层合成

## 5. 注意事项

### 5.1 内存管理
- 及时释放大型图像资源
- 控制缓存大小
- 监控内存使用情况

### 5.2 兼容性处理
- 处理不同设备的性能差异
- 适配不同屏幕尺寸
- 处理图像格式兼容性

### 5.3 错误处理
- 处理资源加载失败
- 处理模板应用失败
- 提供用户友好的错误提示

## 6. 后续优化

1. **性能优化**
   - 实现 WebAssembly 图像处理
   - 优化内存使用
   - 添加性能监控

2. **功能扩展**
   - 支持自定义模板
   - 添加模板参数微调
   - 实现模板组合功能

3. **用户体验**
   - 添加模板预览动画
   - 优化交互反馈
   - 改进模板管理界面

## 7. 开发计划

### 第一阶段：基础框架
- [ ] 搭建目录结构
- [ ] 实现核心类型定义
- [ ] 设置状态管理系统

### 第二阶段：核心功能
- [ ] 实现模板渲染系统
- [ ] 添加资源管理功能
- [ ] 实现基础模板效果

### 第三阶段：UI 实现
- [ ] 开发模板列表界面
- [ ] 实现模板预览功能
- [ ] 添加参数调节界面

### 第四阶段：优化和测试
- [ ] 性能优化
- [ ] 内存管理优化
- [ ] 单元测试和集成测试

## 8. 参考资源

1. PhotoPixel 项目模板实现
2. Skia 图像处理文档
3. React Native 性能优化指南
4. Zustand 状态管理最佳实践 