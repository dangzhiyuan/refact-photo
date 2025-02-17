# PhotoPixel 图片编辑功能实现文档

## 1. 系统架构

### 1.1 核心功能模块

- 图层管理：统一的图层系统，支持多种编辑操作
- 编辑操作：裁剪、旋转、翻转、调整等基础功能
- 预览系统：实时预览和缓存管理
- 性能优化：操作队列、内存管理、GPU 加速

### 1.2 基础数据结构

```typescript
// 图片编辑图层
interface ImageEditLayer extends Layer {
  type: 'image_edit';
  content: {
    sourceImage: SkImage;
    editState: ImageEditState;
    preview?: SkImage; // 实时预览缓存
  };
}

// 编辑状态
interface ImageEditState {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    aspectRatio?: number;
  };
  transform: {
    rotation: number;
    flipX: boolean;
    flipY: boolean;
    scale: number;
  };
  adjustments: {
    brightness: number; // -100 to 100
    contrast: number; // -100 to 100
    saturation: number; // -100 to 100
    exposure: number; // -100 to 100
    temperature: number; // -100 to 100
    tint: number; // -100 to 100
    highlights: number; // -100 to 100
    shadows: number; // -100 to 100
    sharpness: number; // 0 to 100
    blur: number; // 0 to 100
  };
}
```

## 2. 核心功能实现

### 2.1 裁剪系统

```typescript
class CropController {
  private cropFrame: Rect;
  private initialGestureState: GestureState;

  // 处理裁剪手势
  handleCropGesture(gesture: GestureState) {
    if (gesture.type === 'pan') {
      this.updateCropPosition(gesture);
    } else if (gesture.type === 'pinch') {
      this.updateCropSize(gesture);
    } else if (gesture.type === 'rotate') {
      this.updateCropRotation(gesture);
    }
  }

  // 更新裁剪框
  private updateCropFrame(updates: Partial<Rect>) {
    this.cropFrame = {
      ...this.cropFrame,
      ...updates,
    };

    // 确保裁剪框在图片范围内
    this.constrainCropFrame();

    // 保持宽高比
    if (this.aspectRatio) {
      this.maintainAspectRatio();
    }
  }

  // 应用裁剪
  applyCrop(sourceImage: SkImage): SkImage {
    const surface = SkSurface.Make(this.cropFrame.width, this.cropFrame.height);
    const canvas = surface.getCanvas();

    // 应用变换
    canvas.save();
    canvas.translate(-this.cropFrame.x, -this.cropFrame.y);
    canvas.rotate(this.cropFrame.rotation);

    // 绘制图片
    canvas.drawImage(sourceImage, 0, 0);
    canvas.restore();

    return surface.makeImageSnapshot();
  }
}
```

### 2.2 图像调整

```typescript
class ImageAdjustmentController {
  // 应用基础调整
  applyBasicAdjustments(
    sourceImage: SkImage,
    adjustments: ImageEditState['adjustments'],
  ): SkImage {
    const shader = this.createAdjustmentShader(adjustments);

    const surface = SkSurface.Make(sourceImage.width(), sourceImage.height());
    const canvas = surface.getCanvas();

    canvas.drawWithShader(shader, {
      source: sourceImage,
      ...adjustments,
    });

    return surface.makeImageSnapshot();
  }

  // 创建调整着色器
  private createAdjustmentShader(
    adjustments: ImageEditState['adjustments'],
  ): SkShader {
    return SkShader.MakeFromString(`
      uniform shader source;
      uniform float brightness;
      uniform float contrast;
      uniform float saturation;
      
      vec4 main(vec2 coord) {
        vec4 color = source.eval(coord);
        
        // 应用亮度
        color.rgb += brightness;
        
        // 应用对比度
        color.rgb = (color.rgb - 0.5) * contrast + 0.5;
        
        // 应用饱和度
        float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
        color.rgb = mix(vec3(luminance), color.rgb, saturation);
        
        return color;
      }
    `);
  }
}
```

### 2.3 锐化和模糊

```typescript
// 锐化实现
applySharpness(sourceImage: SkImage, amount: number): SkImage {
  const shader = SkShader.MakeFromString(`
    uniform shader source;
    uniform float amount;

    vec4 main(vec2 coord) {
      vec2 off = vec2(1.0 / sourceImage.width(), 1.0 / sourceImage.height());

      vec4 center = source.eval(coord);
      vec4 top = source.eval(coord + vec2(0, -off.y));
      vec4 bottom = source.eval(coord + vec2(0, off.y));
      vec4 left = source.eval(coord + vec2(-off.x, 0));
      vec4 right = source.eval(coord + vec2(off.x, 0));

      vec4 sharpened = center * 2.0 - (top + bottom + left + right) * 0.25;

      return mix(center, sharpened, amount);
    }
  `);

  return this.applyShader(sourceImage, shader, {amount});
}

// 高斯模糊实现
applyBlur(sourceImage: SkImage, radius: number): SkImage {
  const shader = SkShader.MakeFromString(`
    uniform shader source;
    uniform float radius;

    vec4 main(vec2 coord) {
      vec4 color = vec4(0.0);
      float total = 0.0;

      for (float x = -radius; x <= radius; x++) {
        for (float y = -radius; y <= radius; y++) {
          vec2 offset = vec2(x, y) / sourceImage.size();
          float weight = exp(-(x*x + y*y)/(2.0*radius*radius));
          color += source.eval(coord + offset) * weight;
          total += weight;
        }
      }

      return color / total;
    }
  `);

  return this.applyShader(sourceImage, shader, {radius});
}
```

## 3. 性能优化

### 3.1 预览系统

```typescript
class PreviewGenerator {
  private previewSize = 300;
  private previewCache = new Map<string, SkImage>();

  // 生成预览
  async generatePreview(
    layer: ImageEditLayer,
    editType: 'crop' | 'adjust',
  ): Promise<SkImage> {
    const cacheKey = this.generateCacheKey(layer, editType);

    if (this.previewCache.has(cacheKey)) {
      return this.previewCache.get(cacheKey)!;
    }

    // 创建缩略图
    const thumbnail = await this.createThumbnail(
      layer.content.sourceImage,
      this.previewSize,
    );

    // 应用编辑
    let preview: SkImage;
    if (editType === 'crop') {
      preview = this.applyCropPreview(thumbnail, layer.content.editState.crop);
    } else {
      preview = this.applyAdjustmentsPreview(
        thumbnail,
        layer.content.editState.adjustments,
      );
    }

    this.previewCache.set(cacheKey, preview);
    return preview;
  }
}
```

### 3.2 操作队列管理

```typescript
class EditOperationManager {
  private operationQueue: EditOperation[] = [];
  private isProcessing = false;

  // 添加编辑操作
  addOperation(operation: EditOperation) {
    this.operationQueue.push(operation);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  // 处理操作队列
  private async processQueue() {
    this.isProcessing = true;

    while (this.operationQueue.length > 0) {
      const operation = this.operationQueue.shift()!;

      // 检查是否需要生成预览
      if (operation.needsPreview) {
        await this.generatePreview(operation);
      }

      // 应用编辑
      await this.applyEdit(operation);

      // 给UI线程喘息的机会
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    this.isProcessing = false;
  }
}
```

## 4. 用户界面实现

### 4.1 编辑器组件

```typescript
const ImageEditor: FC<{layer: ImageEditLayer}> = ({layer}) => {
  const [activeEdit, setActiveEdit] = useState<'crop' | 'adjust' | null>(null);
  const [preview, setPreview] = useState<SkImage | null>(null);

  // 处理编辑变化
  const handleEditChange = useCallback(
    (editType: string, value: number) => {
      dispatch({
        type: 'UPDATE_IMAGE_EDIT',
        payload: {
          layerId: layer.id,
          editType,
          value,
        },
      });
    },
    [layer.id],
  );

  // 应用编辑
  const applyEdit = useCallback(() => {
    if (!activeEdit) return;

    dispatch({
      type: 'APPLY_IMAGE_EDIT',
      payload: {
        layerId: layer.id,
        editType: activeEdit,
      },
    });

    setActiveEdit(null);
    setPreview(null);
  }, [activeEdit, layer.id]);

  return (
    <View style={styles.container}>
      <ImageEditPreview
        image={preview || layer.content.sourceImage}
        editState={layer.content.editState}
        activeEdit={activeEdit}
      />

      <EditControls
        editState={layer.content.editState}
        activeEdit={activeEdit}
        onEditChange={handleEditChange}
        onApply={applyEdit}
      />
    </View>
  );
};
```

## 5. 系统优势

1. **性能优化**

   - 实时预览系统
   - 操作队列管理
   - 内存使用优化
   - GPU 加速支持

2. **用户体验**

   - 流畅的实时预览
   - 精确的编辑控制
   - 直观的操作反馈
   - 撤销/重做支持

3. **可扩展性**

   - 模块化设计
   - 支持新编辑类型
   - 自定义着色器
   - 灵活的预览系统

4. **内存管理**
   - 智能缓存策略
   - 预览图优化
   - 资源自动释放
   - 内存使用监控

## 6. 后续优化方向

1. **WebAssembly 优化**

   - 复杂图像处理
   - 性能关键路径
   - 大图片处理

2. **多线程支持**

   - Web Workers
   - 并行处理
   - 后台渲染

3. **智能预览**

   - 自适应预览大小
   - 预测性缓存
   - 渐进式加载

4. **手势优化**
   - 自然的交互
   - 精确的控制
   - 流畅的动画

## 7. 注意事项

1. **内存管理**

   - 及时释放不需要的资源
   - 监控内存使用情况
   - 优化缓存策略

2. **性能监控**

   - 跟踪编辑操作性能
   - 监控预览生成时间
   - 分析内存使用趋势

3. **错误处理**

   - 优雅降级策略
   - 错误恢复机制
   - 用户友好的错误提示

4. **兼容性**
   - 支持不同设备
   - 适配不同屏幕
   - 处理性能差异
