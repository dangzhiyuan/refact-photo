import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useCanvasManager } from "../context/CanvasManagerContext";
import { useDrawingStore } from "../store/drawingStore";
import { useEditorStore } from "../store/editorStore";
import { BrushType, DrawingPath } from "../types/drawing";
import {
  Canvas,
  Group,
  Path,
  SkPath,
  Skia,
  useCanvasRef,
} from "@shopify/react-native-skia";
import { 
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { NormalBrush } from "./brushes/NormalBrush";
import { BlackBorderBrush } from "./brushes/BlackBorderBrush";
import { createSmoothPath } from "../utils/drawingUtils";
import { EraserBrush } from "./brushes/EraserBrush";
import { DrawingCursor } from "./DrawingCursor";

export const DrawingCanvas = () => {
  const canvasRef = useCanvasRef();
  const { registerCanvas } = useCanvasManager();
  const { 
    paths, 
    startDrawing, 
    addPoint, 
    endDrawing, 
    isDrawing, 
    currentPathId, 
    color, 
    brushWidth,
    brushType,
  } = useDrawingStore();
  const { editorMode } = useEditorStore();
  
  // 只有在绘图模式下才能交互
  const canInteract = editorMode === "drawing";
  
  // 注册Canvas
  useEffect(() => {
    registerCanvas("drawing", { type: "drawing" });
  }, [registerCanvas]);
  
  // 添加状态以跟踪光标位置
  const cursorX = useSharedValue(0);
  const cursorY = useSharedValue(0);
  const cursorVisible = useSharedValue(false);
  
  // 使用 react-native-gesture-handler 创建手势
  const panGesture = Gesture.Pan()
    .enabled(canInteract)
    .onBegin((event) => {
      // 创建新的Skia路径
      const path = Skia.Path.Make();
      path.moveTo(event.x, event.y);
      
      // 在store中开始新路径
      startDrawing({
        x: event.x,
        y: event.y,
        path,
      }, brushType);
      
      // 更新光标位置
      cursorX.value = event.x;
      cursorY.value = event.y;
      cursorVisible.value = true;
    })
    .onUpdate((event) => {
      if (!isDrawing || !currentPathId) return;
      
      // 添加线段到当前路径
      addPoint({ x: event.x, y: event.y });
      
      // 更新Skia路径
      const currentPath = paths.find(p => p.id === currentPathId);
      if (currentPath && currentPath.points.length > 1) {
        // 获取路径对象引用
        const path = currentPath.path as SkPath;
        
        // 使用平滑算法重绘整个路径
        path.reset(); // 清空路径
        createSmoothPath(currentPath.points, path);
      }
      
      // 更新光标位置
      cursorX.value = event.x;
      cursorY.value = event.y;
    })
    .onEnd(() => {
      if (!isDrawing) return;
      endDrawing();
      
      // 隐藏光标
      cursorVisible.value = false;
    });
  
  // 根据画笔类型渲染对应的组件
  const renderBrush = (path: DrawingPath) => {
    switch (path.brushType) {
      case BrushType.BlackBorder:
        return <BlackBorderBrush key={path.id} path={path} />;
      case BrushType.Eraser:
        return <EraserBrush key={path.id} path={path} />;
      case BrushType.Normal:
      default:
        return <NormalBrush key={path.id} path={path} />;
    }
  };
  
  const cursorSize = useDerivedValue(() => {
    return brushWidth * 2;
  });
  
  return (
    <View
      style={[
        styles.container,
        { pointerEvents: canInteract ? "auto" : "none" }
      ]}
    >
      <GestureDetector gesture={panGesture}>
        <Canvas
          ref={canvasRef}
          style={styles.canvas}
        >
          <Group blendMode="srcOver">
            {paths.map(renderBrush)}
          </Group>
        </Canvas>
      </GestureDetector>
      
      <DrawingCursor 
        x={cursorX} 
        y={cursorY} 
        visible={cursorVisible} 
        color={color}
        size={cursorSize}
      />
    </View>
  );
};

// 辅助函数：从点数组创建Skia路径
const createPathFromPoints = (points: Array<{x: number, y: number}>): any => {
  if (points.length < 2) {
    // 至少需要两个点才能创建有效路径
    const path = Skia.Path.Make();
    if (points.length === 1) {
      // 如果只有一个点，创建一个小圆点
      path.moveTo(points[0].x, points[0].y);
      path.lineTo(points[0].x + 0.1, points[0].y + 0.1);
    }
    return path;
  }
  
  const path = Skia.Path.Make();
  path.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    // 如果点数足够，使用贝塞尔曲线创建平滑的线条
    if (i >= 2) {
      const xc = (points[i].x + points[i-1].x) / 2;
      const yc = (points[i].y + points[i-1].y) / 2;
      path.quadTo(points[i-1].x, points[i-1].y, xc, yc);
    } else {
      path.lineTo(points[i].x, points[i].y);
    }
  }
  
  return path;
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    // 确保绘图Canvas在贴纸Canvas之上
    zIndex: 2,
  },
  canvas: {
    flex: 1,
  },
}); 