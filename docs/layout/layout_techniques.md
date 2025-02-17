# PhotoPixel 布局技巧与适配要点

## 1. 关键布局技巧

### 1.1 比例计算

```typescript
// 屏幕尺寸获取
const windowHeight = useWindowDimensions().height;
const windowWidth = useWindowDimensions().width;

// 比例定义
const windhowsHeightRatio = 0.55; // EditorHome 视图占屏幕高度的 55%
const scaleRatioHeight = 0.95; // EditorCanvas 占 EditorHome 高度的 95%
const scaleRatioWeight = 0.85; // EditorCanvas 占屏幕宽度的 85%
```

### 1.2 Flex 布局

```typescript
// 父容器
safeAera: {
    flex: 1,                    // 占满整个安全区域
    backgroundColor: windowBk,
}

// 子容器
container: {
    justifyContent: 'center',   // 垂直居中
    alignItems: 'center',       // 水平居中
    backgroundColor: windowBk,
}

// 编辑区域
editorBox: {
    flex: 1,                    // 占据剩余空间
    alignItems: 'flex-start',   // 左对齐
    backgroundColor: whiteBk,
}
```

### 1.3 条件渲染

```typescript
// 绘画工具条件渲染
{
  isUseDoodle && <DoodlePaintKits />;
}

// 分类面板条件渲染
<View style={styles.catePanels}>
  {activeCate === 'doodle' ? (
    <DoodleTools />
  ) : (
    <MainCategoryTabs onChange={srcollSwiper} />
  )}
</View>;
```

## 2. 适配要点

### 2.1 不同屏幕尺寸

1. **动态获取尺寸**

   ```typescript
   const {height: windowHeight, width: windowWidth} = useWindowDimensions();
   ```

2. **使用比例布局**

   ```typescript
   style={{
     height: windowHeight * windhowsHeightRatio,
     width: windowWidth * scaleRatioWeight,
   }}
   ```

3. **避免固定尺寸**
   - 使用 flex 布局
   - 使用百分比
   - 使用屏幕比例

### 2.2 安全区域处理

1. **SafeAreaView 使用**

   ```typescript
   <SafeAreaView style={styles.safeArea}>
     <View style={styles.content}>{/* 内容区域 */}</View>
   </SafeAreaView>
   ```

2. **适配不同设备**
   - 自动处理刘海屏
   - 自动处理底部手势条
   - 自动处理状态栏

### 2.3 居中对齐策略

1. **Flexbox 居中**

   ```typescript
   container: {
     justifyContent: 'center',  // 垂直居中
     alignItems: 'center',      // 水平居中
   }
   ```

2. **绝对定位居中**
   ```typescript
   centered: {
     position: 'absolute',
     top: '50%',
     left: '50%',
     transform: [{translateX: '-50%'}, {translateY: '-50%'}],
   }
   ```

### 2.4 动态高度处理

1. **Flex 自适应**

   ```typescript
   container: {
     flex: 1,  // 自动占据剩余空间
   }
   ```

2. **内容自适应**
   ```typescript
   content: {
     flexGrow: 1,       // 允许内容增长
     flexShrink: 1,     // 允许内容收缩
   }
   ```

## 3. 布局调试技巧

### 3.1 边框标记

```typescript
// 开发环境下显示边框
const DEV_STYLE = __DEV__
  ? {
      borderWidth: 1,
      borderColor: 'red',
    }
  : {};

// 在样式中使用
style={[styles.container, DEV_STYLE]}
```

### 3.2 布局检查

```typescript
// 使用 useLayoutEffect 检查布局
useLayoutEffect(() => {
  console.log('Layout dimensions:', {
    width: canvasDimensions.width,
    height: canvasDimensions.height,
  });
}, [canvasDimensions]);
```

### 3.3 性能监控

```typescript
// 监控重新渲染
const RenderCounter = () => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`Component rendered ${renderCount.current} times`);
  });

  return null;
};
```
