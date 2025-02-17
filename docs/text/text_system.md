# PhotoPixel 文字系统实现文档

## 1. 系统架构

### 1.1 核心功能模块

- 文字引擎：处理文字渲染和编辑的核心逻辑
- 字体管理：字体加载、缓存和预览
- 样式系统：文字样式的定义和应用
- 编辑系统：文字的输入和编辑处理

### 1.2 基础数据结构

```typescript
// 文字图层
interface TextLayer extends BaseLayer {
  type: 'text';
  content: {
    text: string;
    style: TextStyle;
    transform: Transform;
    isEditing: boolean;
    isSelected: boolean;
    isVisible: boolean;
    opacity: number;
    blendMode: BlendMode;
  };
}

// 文字样式
interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  backgroundColor?: string;
  letterSpacing: number;
  lineHeight: number;
  textAlign: 'left' | 'center' | 'right';
  textDecoration?: 'none' | 'underline' | 'line-through';
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    stops: number[];
    angle?: number;
  };
}

// 字体定义
interface FontDefinition {
  family: string;
  weight: number;
  style: 'normal' | 'italic';
  source: string;
  preview?: string;
  metadata?: {
    author: string;
    license: string;
    version: string;
  };
}
```

## 2. 核心功能实现

### 2.1 文字管理器

```typescript
class TextManager {
  private layers: Map<string, TextLayer> = new Map();
  private selectedLayer: string | null = null;
  private fontManager: FontManager;

  // 创建文字图层
  createTextLayer(
    text: string,
    position: Point,
    style?: Partial<TextStyle>,
  ): TextLayer {
    const layer: TextLayer = {
      id: generateId(),
      type: 'text',
      content: {
        text,
        style: {
          fontFamily: 'Arial',
          fontSize: 24,
          fontWeight: 400,
          color: '#000000',
          letterSpacing: 0,
          lineHeight: 1.2,
          textAlign: 'left',
          ...style,
        },
        transform: {
          position,
          scale: {x: 1, y: 1},
          rotation: 0,
          origin: {x: 0, y: 0},
        },
        isEditing: true,
        isSelected: true,
        isVisible: true,
        opacity: 1,
        blendMode: 'normal',
      },
      zIndex: this.getTopZIndex() + 1,
    };

    this.layers.set(layer.id, layer);
    this.setSelectedLayer(layer.id);
    return layer;
  }

  // 更新文字内容
  updateText(layerId: string, text: string) {
    const layer = this.layers.get(layerId);
    if (!layer) return;

    layer.content.text = text;
    this.updateTextMetrics(layer);
  }

  // 更新文字样式
  updateStyle(layerId: string, style: Partial<TextStyle>) {
    const layer = this.layers.get(layerId);
    if (!layer) return;

    layer.content.style = {
      ...layer.content.style,
      ...style,
    };
    this.updateTextMetrics(layer);
  }

  // 计算文字度量
  private updateTextMetrics(layer: TextLayer) {
    const font = this.fontManager.getFont(layer.content.style.fontFamily);
    if (!font) return;

    const metrics = font.getMetrics(layer.content.text, {
      size: layer.content.style.fontSize,
      weight: layer.content.style.fontWeight,
      letterSpacing: layer.content.style.letterSpacing,
      lineHeight: layer.content.style.lineHeight,
    });

    // 更新图层边界
    layer.bounds = {
      width: metrics.width,
      height: metrics.height,
    };
  }
}
```

### 2.2 字体管理器

```typescript
class FontManager {
  private fonts: Map<string, FontDefinition> = new Map();
  private loadedFonts: Map<string, SkFont> = new Map();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  // 注册字体
  async registerFont(definition: FontDefinition) {
    this.fonts.set(definition.family, definition);
    await this.loadFont(definition);
  }

  // 加载字体
  private async loadFont(definition: FontDefinition) {
    if (this.loadedFonts.has(definition.family)) return;
    if (this.loadingPromises.has(definition.family)) {
      return this.loadingPromises.get(definition.family);
    }

    const loadPromise = (async () => {
      try {
        const fontData = await fetch(definition.source).then(res =>
          res.arrayBuffer(),
        );
        const typeface = await SkTypeface.MakeFromData(fontData);
        const font = new SkFont(typeface);
        this.loadedFonts.set(definition.family, font);
      } catch (error) {
        console.error(`Failed to load font: ${definition.family}`, error);
      } finally {
        this.loadingPromises.delete(definition.family);
      }
    })();

    this.loadingPromises.set(definition.family, loadPromise);
    return loadPromise;
  }

  // 获取字体
  getFont(family: string): SkFont | null {
    return this.loadedFonts.get(family) || null;
  }

  // 生成字体预览
  async generatePreview(
    family: string,
    text: string = 'AaBbCc123',
  ): Promise<SkImage> {
    const font = this.getFont(family);
    if (!font) throw new Error(`Font not loaded: ${family}`);

    const surface = SkSurface.Make(200, 50);
    const canvas = surface.getCanvas();

    canvas.drawText(text, 10, 35, {
      font,
      paint: {
        color: '#000000',
      },
    });

    return surface.makeImageSnapshot();
  }
}
```

### 2.3 渲染系统

```typescript
class TextRenderer {
  private fontManager: FontManager;

  // 渲染文字
  renderText(canvas: SkCanvas, layer: TextLayer): void {
    const font = this.fontManager.getFont(layer.content.style.fontFamily);
    if (!font) return;

    canvas.save();

    // 应用变换
    this.applyTransform(canvas, layer.content.transform);

    // 设置混合模式和透明度
    canvas.setBlendMode(layer.content.blendMode);
    canvas.setAlpha(layer.content.opacity);

    // 创建文字画笔
    const paint = this.createTextPaint(layer.content.style);

    // 绘制文字
    this.drawText(canvas, layer, font, paint);

    // 如果选中，绘制编辑框
    if (layer.content.isSelected) {
      this.drawEditFrame(canvas, layer);
    }

    canvas.restore();
  }

  // 创建文字画笔
  private createTextPaint(style: TextStyle): SkPaint {
    const paint = new SkPaint();

    // 设置基本样式
    paint.setColor(style.color);
    paint.setTextSize(style.fontSize);

    // 设置渐变（如果有）
    if (style.gradient) {
      const shader = this.createGradientShader(style.gradient);
      paint.setShader(shader);
    }

    // 设置阴影（如果有）
    if (style.shadow) {
      paint.setImageFilter(
        SkImageFilter.MakeDropShadow(
          style.shadow.offsetX,
          style.shadow.offsetY,
          style.shadow.blur,
          style.shadow.color,
        ),
      );
    }

    return paint;
  }

  // 绘制文字
  private drawText(
    canvas: SkCanvas,
    layer: TextLayer,
    font: SkFont,
    paint: SkPaint,
  ) {
    const {text, style} = layer.content;
    const lines = text.split('\n');

    let y = 0;
    for (const line of lines) {
      const width = font.getTextWidth(line);
      let x = 0;

      // 处理文本对齐
      switch (style.textAlign) {
        case 'center':
          x = (layer.bounds.width - width) / 2;
          break;
        case 'right':
          x = layer.bounds.width - width;
          break;
      }

      canvas.drawText(line, x, y, {font, paint});
      y += style.fontSize * style.lineHeight;
    }
  }
}
```

## 3. 性能优化

### 3.1 字体缓存

```typescript
class FontCache {
  private static readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private cacheSize = 0;
  private cache = new Map<
    string,
    {
      font: SkFont;
      size: number;
      lastUsed: number;
    }
  >();

  // 添加到缓存
  addToCache(key: string, font: SkFont, size: number) {
    // 检查缓存大小
    while (this.cacheSize + size > FontCache.MAX_CACHE_SIZE) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      font,
      size,
      lastUsed: Date.now(),
    });
    this.cacheSize += size;
  }

  // 清理最少使用的缓存
  private evictLeastRecentlyUsed() {
    let oldest: [string, {lastUsed: number; size: number}] | null = null;
    for (const [key, entry] of this.cache.entries()) {
      if (!oldest || entry.lastUsed < oldest[1].lastUsed) {
        oldest = [key, entry];
      }
    }

    if (oldest) {
      this.cache.delete(oldest[0]);
      this.cacheSize -= oldest[1].size;
    }
  }
}
```

### 3.2 渲染优化

```typescript
class TextRenderOptimizer {
  // 检查是否需要重新渲染
  needsRerender(layer: TextLayer, prevLayer: TextLayer): boolean {
    return (
      layer.content.text !== prevLayer.content.text ||
      this.hasStyleChanged(layer.content.style, prevLayer.content.style) ||
      this.hasTransformChanged(
        layer.content.transform,
        prevLayer.content.transform,
      )
    );
  }

  // 计算渲染区域
  calculateBounds(layer: TextLayer): Rect {
    const {transform, style} = layer.content;
    const margin = style.fontSize * 0.5; // 添加边距

    return {
      x: transform.position.x - margin,
      y: transform.position.y - margin,
      width: layer.bounds.width + margin * 2,
      height: layer.bounds.height + margin * 2,
    };
  }
}
```

## 4. 用户界面实现

### 4.1 文字编辑器

```typescript
const TextEditor: FC<{layer: TextLayer}> = ({layer}) => {
  return (
    <View style={styles.editorContainer}>
      <TextInput
        value={layer.content.text}
        onChangeText={handleTextChange}
        style={[styles.input, getTextStyles(layer.content.style)]}
        multiline
      />

      <StyleControls style={layer.content.style} onChange={handleStyleChange} />

      <TransformControls
        transform={layer.content.transform}
        onChange={handleTransformChange}
      />
    </View>
  );
};
```

### 4.2 字体选择器

```typescript
const FontSelector: FC<{
  value: string;
  onChange: (font: string) => void;
}> = ({value, onChange}) => {
  const fonts = useFonts();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFonts = useMemo(
    () =>
      fonts.filter(font =>
        font.family.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [fonts, searchQuery],
  );

  return (
    <View style={styles.container}>
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="搜索字体..."
      />

      <ScrollView style={styles.fontList}>
        {filteredFonts.map(font => (
          <FontItem
            key={font.family}
            font={font}
            isSelected={font.family === value}
            onSelect={() => onChange(font.family)}
          />
        ))}
      </ScrollView>
    </View>
  );
};
```

## 5. 系统优势

1. **丰富的文字功能**

   - 多字体支持
   - 完整的样式控制
   - 渐变和特效
   - 实时预览

2. **高性能处理**

   - 字体缓存管理
   - 渲染优化
   - 内存使用优化
   - 流畅的编辑体验

3. **灵活的编辑功能**

   - 实时编辑
   - 样式调整
   - 变换控制
   - 特效应用

4. **良好的扩展性**
   - 自定义字体支持
   - 样式系统扩展
   - 特效系统扩展
   - 渲染引擎定制

## 6. 注意事项

1. **性能考虑**

   - 控制字体加载数量
   - 优化渲染性能
   - 管理内存使用
   - 缓存策略优化

2. **用户体验**

   - 平滑的编辑体验
   - 即时的样式预览
   - 准确的文字度量
   - 响应式的交互

3. **字体管理**

   - 字体加载策略
   - 许可证管理
   - 字体预览生成
   - 字体回退机制

4. **错误处理**
   - 字体加载失败处理
   - 渲染错误处理
   - 样式验证
   - 用户输入验证
