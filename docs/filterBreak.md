# LUT 滤镜实现分析

## 1. 核心组件

### 1.1 滤镜着色器
```glsl
// LUT 查找表着色器
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
```

### 1.2 滤镜引擎
主要包含三个核心方法：
- loadLut: 加载并缓存 LUT 图片
- applyFilter: 应用滤镜效果
- createPreview: 创建预览效果

## 2. 实现流程

### 2.1 加载 LUT 图片
```typescript
async loadLut(lutType: LutType): Promise<SkImage | null> {
  // 1. 检查缓存
  if (this.lutCache.has(lutType)) {
    return this.lutCache.get(lutType)!;
  }

  // 2. 使用 Asset 加载资源
  const asset = Asset.fromModule(LutImages[lutType]);
  await asset.downloadAsync();

  // 3. 从本地文件加载图片数据
  const response = await fetch(asset.localUri);
  const buffer = await response.arrayBuffer();
  const data = Skia.Data.fromBytes(new Uint8Array(buffer));
  
  // 4. 创建 Skia 图片
  const image = Skia.Image.MakeImageFromEncoded(data);

  // 5. 存入缓存
  this.lutCache.set(lutType, image);

  return image;
}
```

### 2.2 应用滤镜
```typescript
async applyFilter(
  sourceImage: SkImage,
  lutImage: SkImage,
  intensity: number = 1
): Promise<SkImage | null> {
  // 1. 创建离屏渲染表面
  const surface = Skia.Surface.Make(
    sourceImage.width(),
    sourceImage.height()
  );

  // 2. 创建图片着色器
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

  // 3. 创建 LUT 着色器
  const shader = LUT_SHADER.makeShaderWithChildren(
    [intensity],
    [sourceShader, lutShader]
  );

  // 4. 绘制
  const paint = Skia.Paint();
  paint.setShader(shader);
  canvas.drawRect(
    { x: 0, y: 0, width: sourceImage.width(), height: sourceImage.height() },
    paint
  );

  // 5. 获取结果
  return surface.makeImageSnapshot();
}
```

## 3. 关键点说明

1. **着色器参数**:
   - image: 源图片着色器
   - luts: LUT 图片着色器
   - intensity: 滤镜强度 (0-1)

2. **着色器选项**:
   - TileMode.Decal: 边缘处理模式
   - FilterMode.Nearest: 像素采样模式
   - MipmapMode.None: 禁用 mipmap

3. **LUT 图片要求**:
   - 尺寸: 512x512
   - 格式: JPEG/PNG
   - 结构: 8x8 网格，每个格子 64x64 像素

4. **性能优化**:
   - 使用 LUT 图片缓存
   - 支持预览模式
   - 离屏渲染

## 4. 使用示例

```typescript
const filterEngine = new FilterEngine();

// 加载 LUT
const lutImage = await filterEngine.loadLut('lut1');

// 应用滤镜
const result = await filterEngine.applyFilter(sourceImage, lutImage, 0.5);
``` 