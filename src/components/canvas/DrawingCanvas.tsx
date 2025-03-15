import React, { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import {
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import { useDrawingStore } from "../../store/drawingStore";
import { useCanvasStore } from "../../store/canvasStore";
import { DrawingPath, LayerType, DrawingLayer } from "../../core/types/canvas";
import { useEditorStore } from "../../store/editorStore";
import { EditorMode } from "../../core/types/canvas";

interface DrawingCanvasProps {
  width: number;
  height: number;
  onLayerCreated?: (layerId: string) => void;
}

// 将SVG路径生成函数提取为工具函数，优化性能
const generateSvgPath = (points: { x: number; y: number }[]): string => {
  if (points.length < 2) return "";

  const start = points[0];
  let path = `M ${start.x} ${start.y}`;

  // 使用二次贝塞尔曲线创建平滑路径
  for (let i = 1; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const xc = (p1.x + p2.x) / 2;
    const yc = (p1.y + p2.y) / 2;
    path += ` Q ${p1.x} ${p1.y}, ${xc} ${yc}`;
  }

  // 将最后一点添加到路径
  if (points.length > 1) {
    const last = points[points.length - 1];
    path += ` L ${last.x} ${last.y}`;
  }

  return path;
};

// 简单的路径组件
const MemoPath = React.memo(({ path }: { path: DrawingPath }) => {
  if (!path || !path.points || path.points.length < 2) return null;
  
  const svgPath = generateSvgPath(path.points);
  
  return (
    <Path
      path={svgPath}
      color={path.color}
      style="stroke"
      strokeWidth={path.strokeWidth}
      strokeCap="round"
      strokeJoin="round"
      opacity={path.opacity}
    />
  );
});

export const DrawingCanvas: React.FC<DrawingCanvasProps> = React.memo(
  ({ width, height, onLayerCreated }) => {
    // 添加一个状态指示器，检测组件是否仍处于活动状态
    const isComponentMounted = useRef(true);
    
    const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
    const [paths, setPaths] = useState<DrawingPath[]>([]);
    const { currentBrush } = useDrawingStore();
    const { addLayer, addDrawingLayer } = useCanvasStore();
    const currentMode = useEditorStore((state) => state.currentMode);
    
    // 存储上一次的模式，用于检测模式变化
    const prevModeRef = useRef<EditorMode>(currentMode);
    
    // 在组件卸载时设置标志
    useEffect(() => {
      isComponentMounted.current = true;
      console.log('[DrawingCanvas] Component mounted');
      
      return () => {
        console.log('[DrawingCanvas] Component unmounting');
        isComponentMounted.current = false;
      };
    }, []);
    
    // 基本的路径引用，用于积累路径
    const pathsRef = useRef<DrawingPath[]>([]);
    
    // 简单地更新引用，没有复杂逻辑
    useEffect(() => {
      pathsRef.current = paths;
    }, [paths]);
    
    // 直接使用addDrawingLayer方法创建图层
    const createLayer = useCallback(() => {
      if (!isComponentMounted.current) {
        console.log('[DrawingCanvas] Attempted to create layer after unmount, aborting');
        return;
      }
      
      if (pathsRef.current.length === 0) {
        console.log('[DrawingCanvas] No paths to create layer');
        return;
      }
      
      try {
        console.log('[DrawingCanvas] Creating drawing layer with paths:', pathsRef.current.length);
        
        // 使用专门的绘图图层创建方法
        const layerId = addDrawingLayer([...pathsRef.current]);
        
        if (onLayerCreated && isComponentMounted.current) {
          onLayerCreated(layerId);
        }
        
        if (isComponentMounted.current) {
          console.log('[DrawingCanvas] Layer created, clearing paths');
          setPaths([]);
        }
      } catch (error) {
        console.error("Error creating drawing layer:", error);
      }
    }, [addDrawingLayer, onLayerCreated]);
    
    // 监听模式变化，从绘画模式切换出去时保存图层
    useEffect(() => {
      console.log('[DrawingCanvas] Mode changed:', currentMode, 'Previous:', prevModeRef.current);
      
      // 直接检查当前模式和路径状态
      if (prevModeRef.current === EditorMode.DRAW && 
          currentMode !== EditorMode.DRAW) {
        
        console.log('[DrawingCanvas] Exited drawing mode');
        
        // 如果有绘制内容，则保存为图层
        const hasCurrentPath = currentPath !== null;
        const hasPaths = paths.length > 0;
        
        if (hasCurrentPath || hasPaths) {
          console.log('[DrawingCanvas] Saving drawing content on mode change');
          
          // 如果有当前正在绘制的路径，先保存它
          if (hasCurrentPath) {
            console.log('[DrawingCanvas] Adding current path to paths collection');
            setPaths(prev => {
              const updatedPaths = [...prev, currentPath!];
              // 立即更新pathsRef以确保createLayer能访问到最新路径
              pathsRef.current = updatedPaths;
              return updatedPaths;
            });
            setCurrentPath(null);
          }
          
          // 在下一个事件循环中创建图层，确保状态已更新
          setTimeout(() => {
            if (isComponentMounted.current) {
              console.log('[DrawingCanvas] Creating layer after mode change');
              createLayer();
            }
          }, 50);
        } else {
          console.log('[DrawingCanvas] No drawing content to save');
        }
      }
      
      // 更新上一次的模式
      prevModeRef.current = currentMode;
    }, [currentMode, currentPath, paths, createLayer]);
    
    // 组件卸载时创建图层
    useEffect(() => {
      return () => {
        if (pathsRef.current.length > 0) {
          console.log('[DrawingCanvas] Component unmounting with paths, creating layer');
          // 直接调用createLayer，不通过状态更新
          if (isComponentMounted.current) {
            createLayer();
          } else {
            // 如果组件已卸载但仍需保存，直接使用store方法
            addDrawingLayer([...pathsRef.current]);
          }
        }
      };
    }, [createLayer, addDrawingLayer]);
    
    // 开始绘制函数
    const startDrawing = useCallback((x: number, y: number) => {
      if (!isComponentMounted.current) {
        console.log('[DrawingCanvas] Attempted to start drawing after unmount, aborting');
        return;
      }
      
      console.log('[DrawingCanvas] startDrawing called', { x, y });
      // 创建简单的路径对象
      const newPath: DrawingPath = {
        id: `path_${Date.now()}`,
        points: [{ x, y }],
        color: currentBrush.color,
        strokeWidth: currentBrush.strokeWidth,
        opacity: currentBrush.opacity,
        brushType: currentBrush.type,
        brushSettings: currentBrush.settings
      };
      
      console.log('[DrawingCanvas] Created new path:', newPath.id);
      setCurrentPath(newPath);
    }, [currentBrush]);
    
    // 添加点函数
    const addPoint = useCallback((x: number, y: number) => {
      if (!isComponentMounted.current) {
        console.log('[DrawingCanvas] Attempted to add point after unmount, aborting');
        return;
      }
      
      console.log('[DrawingCanvas] addPoint called', { x, y });
      if (!currentPath) {
        console.log('[DrawingCanvas] No current path, ignoring point');
        return;
      }
      
      // 创建更新后的路径对象
      const updatedPath = {
        ...currentPath,
        points: [...currentPath.points, { x, y }]
      };
      
      console.log('[DrawingCanvas] Updated path:', updatedPath.id, 'total points:', updatedPath.points.length);
      setCurrentPath(updatedPath);
    }, [currentPath]);
    
    // 结束绘制函数
    const endDrawing = useCallback(() => {
      if (!isComponentMounted.current) {
        console.log('[DrawingCanvas] Attempted to end drawing after unmount, aborting');
        return;
      }
      
      console.log('[DrawingCanvas] endDrawing called');
      if (!currentPath) {
        console.log('[DrawingCanvas] No current path to end');
        return;
      }
      
      console.log('[DrawingCanvas] Saving path:', currentPath.id, 'with', currentPath.points.length, 'points');
      
      // 保存当前路径到路径数组
      setPaths(prev => {
        const updatedPaths = [...prev, currentPath];
        // 立即更新pathsRef以确保下面的代码可以访问到最新路径
        pathsRef.current = updatedPaths;
        return updatedPaths;
      });
      
      // 清除当前绘制路径
      setCurrentPath(null);
      
      // 自动保存逻辑：当路径数量超过一定数值或者单个路径点数过多时，自动创建图层
      const currentPathPointCount = currentPath.points.length;
      const totalPathsCount = paths.length + 1; // 加上当前刚添加的路径
      
      if (totalPathsCount > 20 || currentPathPointCount > 500) {
        console.log('[DrawingCanvas] Auto-saving drawing due to paths count or points threshold');
        
        // 使用setTimeout确保setPaths已执行完毕
        setTimeout(() => {
          if (isComponentMounted.current) {
            createLayer();
          }
        }, 50);
      }
    }, [currentPath, paths.length, createLayer]);
    
    // 使用新的Gesture API创建手势
    const panGesture = Gesture.Pan()
      .minDistance(0)
      .averageTouches(false)
      .onStart((event) => {
        console.log('[DrawingCanvas:gesture] onStart event', event.x, event.y);
        // 只有在绘画模式下才处理手势
        if (currentMode === EditorMode.DRAW) {
          // 添加坐标验证，确保触摸点在画布范围内
          if (event.x >= 0 && event.x <= width && event.y >= 0 && event.y <= height) {
            runOnJS(startDrawing)(event.x, event.y);
          } else {
            console.log('[DrawingCanvas:gesture] Touch outside canvas boundaries, ignoring');
          }
        } else {
          console.log('[DrawingCanvas:gesture] Ignoring gesture start - not in drawing mode');
        }
      })
      .onUpdate((event) => {
        // 只有在绘画模式下才处理手势
        if (currentMode === EditorMode.DRAW) {
          // 添加坐标验证，确保触摸点在画布范围内或已经开始绘制
          if (event.x >= 0 && event.x <= width && event.y >= 0 && event.y <= height) {
            runOnJS(addPoint)(event.x, event.y);
          }
        }
      })
      .onEnd(() => {
        // 只有在绘画模式下才处理手势
        if (currentMode === EditorMode.DRAW) {
          runOnJS(endDrawing)();
        } else {
          console.log('[DrawingCanvas:gesture] Ignoring gesture end - not in drawing mode');
        }
      });
    
    // 渲染所有保存的路径
    const pathComponents = useMemo(() => {
      return paths.map(path => <MemoPath key={path.id} path={path} />);
    }, [paths]);
    
    // 渲染当前正在绘制的路径
    const currentPathComponent = useMemo(() => {
      if (!currentPath) return null;
      return <MemoPath key="current" path={currentPath} />;
    }, [currentPath]);
    
    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View style={{ width, height }}>
          <Canvas style={styles.canvas}>
            {pathComponents}
            {currentPathComponent}
          </Canvas>
        </Animated.View>
      </GestureDetector>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.width === nextProps.width && 
           prevProps.height === nextProps.height;
  }
);

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  }
});
