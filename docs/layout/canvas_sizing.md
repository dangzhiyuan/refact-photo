# PhotoPixel 画布尺寸计算系统

## 1. 计算逻辑

```typescript
const computeAndSetCanvasDimensions = (width: number, height: number) => {
  // 1. 计算图片宽高比
  const imageAspectRatio = width / height;
  let canvasWidth = 0;
  let canvasHeight = 0;

  // 2. 初始宽度适配
  canvasWidth = width > parentScreenWidth ? parentScreenWidth : width;
  canvasHeight = canvasWidth / imageAspectRatio;

  // 3. 高度溢出检查
  if (canvasHeight > parentScreenHeight) {
    canvasHeight = parentScreenHeight;
    canvasWidth = canvasHeight * imageAspectRatio;
  }

  // 4. 宽度溢出检查
  if (canvasWidth > parentScreenWidth) {
    canvasWidth = parentScreenWidth;
    canvasHeight = canvasWidth / imageAspectRatio;
  }

  // 5. 最小尺寸保证
  if (canvasWidth < parentScreenWidth && canvasHeight < parentScreenHeight) {
    canvasWidth = parentScreenWidth;
    canvasHeight = parentScreenHeight;
  }

  // 6. 更新状态
  setCanvasDimensions({width: canvasWidth, height: canvasHeight});
  setCanvasCenter({width: canvasWidth / 2, height: canvasHeight / 2});
};
```

## 2. 计算结果应用

计算出的画布尺寸在以下场景中使用：

### 2.1 基础容器布局

```typescript
<View style={[{
    width: canvasDimensions.width,
    height: canvasDimensions.height,
    justifyContent: 'center',
    alignItems: 'center',
}]}>
```

### 2.2 图片渲染

```typescript
<Canvas
  style={[
    styles.canvas,
    {
      width: canvasDimensions.width,
      height: canvasDimensions.height,
    },
  ]}>
  <Image
    image={image}
    fit="fill"
    width={canvasDimensions.width}
    height={canvasDimensions.height}
  />
</Canvas>
```

### 2.3 特效画布

```typescript
<FilterCanvasFill
  orig_image={image}
  canvas_width={canvasDimensions.width}
  canvas_height={canvasDimensions.height}
/>
```

### 2.4 贴纸定位

```typescript
<SvgStickerFrame
  canvas_width={canvasCenter.width}
  canvas_height={canvasCenter.height}
/>
```

## 3. 尺寸计算示例

### 3.1 宽图示例

- 原始尺寸：1000x500，比例 2:1
- 屏幕尺寸：360x640
- 计算结果：360x640（保持最小屏幕尺寸）
- 中心点：(180, 320)

### 3.2 高图示例

- 原始尺寸：500x1000，比例 1:2
- 屏幕尺寸：360x640
- 计算结果：360x640（保持最小屏幕尺寸）
- 中心点：(180, 320)

## 4. 设计考虑

### 4.1 比例保持

- 保持原始图片的宽高比
- 避免图片变形

### 4.2 显示完整

- 确保图片完整显示在屏幕内
- 防止内容溢出

### 4.3 操作空间

- 画布尺寸不小于屏幕尺寸
- 确保有足够的编辑操作空间

### 4.4 居中对齐

- 计算画布中心点
- 用于贴纸等元素的定位参考
