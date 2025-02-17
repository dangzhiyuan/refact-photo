# PhotoPixel 核心布局实现

## 1. 核心布局结构

```typescript
// EditorHome.tsx
import {
  SafeAreaView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

const EditorHome: FC = () => {
  // 1. 获取屏幕尺寸
  const windowHeight = useWindowDimensions().height;
  const windowWidth = useWindowDimensions().width;

  // 2. 定义布局比例常量
  const windhowsHeightRatio = 0.55; // EditorHome 视图占屏幕高度的 55%
  const scaleRatioHeight = 0.95; // EditorCanvas 占 EditorHome 高度的 95%
  const scaleRatioWeight = 0.85; // EditorCanvas 占屏幕宽度的 85%

  return (
    <SafeAreaView style={styles.safeAera}>
      {/* 顶部标题栏 */}
      <CanvasHeader headerName={activeCateName} />

      {/* 画布容器 */}
      <View
        style={[
          styles.container,
          {
            height: windowHeight * windhowsHeightRatio,
            width: '100%',
          },
        ]}>
        <EditorCanvas
          parentScreenHeight={
            windowHeight * windhowsHeightRatio * scaleRatioHeight
          }
          parentScreenWidth={windowWidth * scaleRatioWeight}
        />
      </View>

      {/* 绘画工具（条件渲染） */}
      {isUseDoodle && <DoodlePaintKits />}

      {/* 底部编辑区 */}
      <View style={styles.editorBox}>
        <View style={styles.catePanels}>
          <MainCategoryTabs onChange={srcollSwiper} />
        </View>
        <EditorPanels />
      </View>
    </SafeAreaView>
  );
};
```

## 2. 样式定义

```typescript
const styles = StyleSheet.create({
  // 安全区域样式
  safeAera: {
    backgroundColor: windowBk,
    flex: 1, // 占满整个安全区域
  },

  // 画布容器样式
  container: {
    backgroundColor: windowBk,
    justifyContent: 'center', // 垂直居中
    alignItems: 'center', // 水平居中
  },

  // 编辑区域样式
  editorBox: {
    backgroundColor: whiteBk,
    flex: 1,
    alignItems: 'flex-start', // 左对齐
  },

  // 分类面板样式
  catePanels: {
    height: operatorTabHeightLevelOne,
    flexDirection: 'column',
    backgroundColor: windowBk,
  },
});
```

## 3. 布局原理解析

### 3.1 垂直方向布局

1. **SafeAreaView**

   - 使用 `flex: 1` 占满整个安全区域
   - 确保内容不会被刘海屏、底部手势条等遮挡

2. **画布区域**

   - 高度使用屏幕高度的固定比例：`windowHeight * windhowsHeightRatio`
   - 内部画布再次缩放：`windowHeight * windhowsHeightRatio * scaleRatioHeight`

3. **底部编辑区**
   - 使用 `flex: 1` 自动占据剩余空间
   - 分类面板使用固定高度

### 3.2 水平方向布局

1. **画布宽度**

   - 使用屏幕宽度的固定比例：`windowWidth * scaleRatioWeight`
   - 保持居中对齐

2. **编辑区域**
   - 宽度占满：`width: '100%'`
   - 内容左对齐
