import React, { useMemo, useCallback, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { BaseCanvas } from "./canvas/BaseCanvas";
import { ContentCanvas } from "./canvas/ContentCanvas";
import { StickerCanvas } from "./canvas/StickerCanvas";
import { LayerVisibility } from "../hooks/useLayerVisibility";
import { useCanvasStore } from "../store/canvasStore";
import { LayerType, DrawingPath } from "../core/types/canvas";
import { Canvas, Path } from "@shopify/react-native-skia";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useDrawingGestures } from "../hooks/useDrawingGestures";
import { SelectionFrame } from "./common/SelectionFrame";

interface CanvasManagerProps {
  activeCanvas: string;
  setActiveCanvas: (canvasType: string) => void;
  initialScale?: number;
  fitScale?: number;
  visibleLayers?: LayerVisibility;
  onCanvasSizeChange?: (size: { width: number; height: number }) => void;
}

type GestureState = ReturnType<typeof useDrawingGestures>[0];
interface DrawingGestureStates {
  [key: string]: GestureState;
}

const MAX_DRAWING_LAYERS = 5;

// 提前定义绘画路径边界框计算函数，确保它在任何地方都可用
const calculatePathsBoundingBox = (paths: DrawingPath[]) => {
  // 初始化边界值为极值
  let minX = Number.MAX_SAFE_INTEGER;
  let minY = Number.MAX_SAFE_INTEGER;
  let maxX = Number.MIN_SAFE_INTEGER;
  let maxY = Number.MIN_SAFE_INTEGER;
  
  // 处理路径点为空的情况
  if (paths.length === 0 || paths.every(path => path.points.length === 0)) {
    return { x: 0, y: 0, width: 100, height: 100 }; // 提供一个默认大小
  }
  
  // 遍历所有路径和点找出边界
  paths.forEach(path => {
    path.points.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
  });
  
  // 添加适当的内边距
  const padding = 20;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;
  
  // 计算宽度和高度
  const width = maxX - minX;
  const height = maxY - minY;
  
  return { 
    x: minX, 
    y: minY, 
    width: Math.max(width, 50), // 确保至少有最小宽度
    height: Math.max(height, 50) // 确保至少有最小高度
  };
};

// SVG路径生成函数也提前定义
const generateSvgPath = (points: { x: number; y: number }[]): string => {
  if (points.length < 2) return "";

  const start = points[0];
  let path = `M ${start.x} ${start.y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const xc = (p1.x + p2.x) / 2;
    const yc = (p1.y + p2.y) / 2;
    path += ` Q ${p1.x} ${p1.y}, ${xc} ${yc}`;
  }

  const last = points[points.length - 1];
  path += ` L ${last.x} ${last.y}`;

  return path;
};

export const CanvasManager: React.FC<CanvasManagerProps> = ({
  activeCanvas,
  setActiveCanvas,
  initialScale = 1,
  fitScale = 0.85,
  visibleLayers = { base: true, content: true },
  onCanvasSizeChange,
}) => {
  const { layers, layerIds } = useCanvasStore();
  
  const stickerLayers = layerIds.filter(
    (id) => layers[id] && layers[id].type === LayerType.STICKER
  );

  const drawingLayers = layerIds.filter(
    (id) => layers[id] && layers[id].type === LayerType.DRAWING
  );

  const deleteLayer = useCanvasStore((state) => state.deleteLayer);
  
  // 创建共享值用于选择框
  const dummyRotation = useSharedValue(0);
  const dummyPosition = useSharedValue({ x: 0, y: 0 });
  const dummyScale = useSharedValue(1);
  const windowSize = Dimensions.get('window');

  const handleCanvasSelect = useCallback(
    (canvasId: string) => {
      if (canvasId !== activeCanvas) {
        setActiveCanvas(canvasId);
      }
    },
    [activeCanvas, setActiveCanvas]
  );

  const handleCanvasDragStart = useCallback(
    (canvasId: string) => {
      if (canvasId !== activeCanvas) {
        setActiveCanvas(canvasId);
      }
    },
    [activeCanvas, setActiveCanvas]
  );

  // 使用自定义 hook 获取手势状态，现在它会自动处理变换的保存和恢复
  const gestureStates = useDrawingGestures(
    drawingLayers,
    handleCanvasDragStart
  );

  // 将绘画图层映射到手势状态
  const drawingGestureStates = useMemo(() => {
    const states: DrawingGestureStates = {};
    drawingLayers.forEach((layerId, index) => {
      if (index < gestureStates.length) {
        states[layerId] = gestureStates[index];
      }
    });
    return states;
  }, [drawingLayers, gestureStates]);
  
  // 预先计算每个绘画图层的边界框
  const pathBounds = useMemo(() => {
    const bounds: Record<string, ReturnType<typeof calculatePathsBoundingBox>> = {};
    
    drawingLayers.forEach(layerId => {
      const layer = layers[layerId];
      if (layer && layer.type === LayerType.DRAWING) {
        bounds[layerId] = calculatePathsBoundingBox(layer.paths);
      }
    });
    
    return bounds;
  }, [drawingLayers, layers]);

  // 在顶层直接声明所有的动画样式 hooks，不要在循环或其他 hooks 中调用
  const animatedStyle0 = useAnimatedStyle(() => {
    if (gestureStates[0]) {
      return {
        transform: [
          { translateX: gestureStates[0].offset.value.x },
          { translateY: gestureStates[0].offset.value.y },
          { scale: gestureStates[0].scale.value },
        ],
      };
    }
    return {};
  }, [gestureStates]);

  const animatedStyle1 = useAnimatedStyle(() => {
    if (gestureStates[1]) {
      return {
        transform: [
          { translateX: gestureStates[1].offset.value.x },
          { translateY: gestureStates[1].offset.value.y },
          { scale: gestureStates[1].scale.value },
        ],
      };
    }
    return {};
  }, [gestureStates]);

  const animatedStyle2 = useAnimatedStyle(() => {
    if (gestureStates[2]) {
      return {
        transform: [
          { translateX: gestureStates[2].offset.value.x },
          { translateY: gestureStates[2].offset.value.y },
          { scale: gestureStates[2].scale.value },
        ],
      };
    }
    return {};
  }, [gestureStates]);

  const animatedStyle3 = useAnimatedStyle(() => {
    if (gestureStates[3]) {
      return {
        transform: [
          { translateX: gestureStates[3].offset.value.x },
          { translateY: gestureStates[3].offset.value.y },
          { scale: gestureStates[3].scale.value },
        ],
      };
    }
    return {};
  }, [gestureStates]);

  const animatedStyle4 = useAnimatedStyle(() => {
    if (gestureStates[4]) {
      return {
        transform: [
          { translateX: gestureStates[4].offset.value.x },
          { translateY: gestureStates[4].offset.value.y },
          { scale: gestureStates[4].scale.value },
        ],
      };
    }
    return {};
  }, [gestureStates]);

  // 为选择框也单独定义动画样式，而不是在循环中创建
  const selectionFrameStyle0 = useAnimatedStyle(() => {
    if (!gestureStates[0]) return {};
    const layerId = drawingLayers[0];
    if (!layerId) return {};
    
    const bounds = pathBounds[layerId] || { x: 0, y: 0, width: 100, height: 100 };
    return {
      position: 'absolute' as const,
      left: bounds.x + gestureStates[0].offset.value.x,
      top: bounds.y + gestureStates[0].offset.value.y,
      width: bounds.width,
      height: bounds.height,
      transform: [{ scale: gestureStates[0].scale.value }]
    };
  }, [gestureStates, pathBounds, drawingLayers]);

  const selectionFrameStyle1 = useAnimatedStyle(() => {
    if (!gestureStates[1]) return {};
    const layerId = drawingLayers[1];
    if (!layerId) return {};
    
    const bounds = pathBounds[layerId] || { x: 0, y: 0, width: 100, height: 100 };
    return {
      position: 'absolute' as const,
      left: bounds.x + gestureStates[1].offset.value.x,
      top: bounds.y + gestureStates[1].offset.value.y,
      width: bounds.width,
      height: bounds.height,
      transform: [{ scale: gestureStates[1].scale.value }]
    };
  }, [gestureStates, pathBounds, drawingLayers]);

  const selectionFrameStyle2 = useAnimatedStyle(() => {
    if (!gestureStates[2]) return {};
    const layerId = drawingLayers[2];
    if (!layerId) return {};
    
    const bounds = pathBounds[layerId] || { x: 0, y: 0, width: 100, height: 100 };
    return {
      position: 'absolute' as const,
      left: bounds.x + gestureStates[2].offset.value.x,
      top: bounds.y + gestureStates[2].offset.value.y,
      width: bounds.width,
      height: bounds.height,
      transform: [{ scale: gestureStates[2].scale.value }]
    };
  }, [gestureStates, pathBounds, drawingLayers]);

  const selectionFrameStyle3 = useAnimatedStyle(() => {
    if (!gestureStates[3]) return {};
    const layerId = drawingLayers[3];
    if (!layerId) return {};
    
    const bounds = pathBounds[layerId] || { x: 0, y: 0, width: 100, height: 100 };
    return {
      position: 'absolute' as const,
      left: bounds.x + gestureStates[3].offset.value.x,
      top: bounds.y + gestureStates[3].offset.value.y,
      width: bounds.width,
      height: bounds.height,
      transform: [{ scale: gestureStates[3].scale.value }]
    };
  }, [gestureStates, pathBounds, drawingLayers]);

  const selectionFrameStyle4 = useAnimatedStyle(() => {
    if (!gestureStates[4]) return {};
    const layerId = drawingLayers[4];
    if (!layerId) return {};
    
    const bounds = pathBounds[layerId] || { x: 0, y: 0, width: 100, height: 100 };
    return {
      position: 'absolute' as const,
      left: bounds.x + gestureStates[4].offset.value.x,
      top: bounds.y + gestureStates[4].offset.value.y,
      width: bounds.width,
      height: bounds.height,
      transform: [{ scale: gestureStates[4].scale.value }]
    };
  }, [gestureStates, pathBounds, drawingLayers]);

  // 将所有选择框样式合并到数组中，不在 useMemo 中调用 hooks
  const selectionFrameStyles = useMemo(() => {
    return [
      selectionFrameStyle0,
      selectionFrameStyle1,
      selectionFrameStyle2,
      selectionFrameStyle3,
      selectionFrameStyle4,
    ];
  }, [
    selectionFrameStyle0,
    selectionFrameStyle1,
    selectionFrameStyle2,
    selectionFrameStyle3,
    selectionFrameStyle4,
  ]);

  // 将所有动画样式合并到一个数组中
  const animatedStyles = useMemo(() => {
    return [
      animatedStyle0,
      animatedStyle1,
      animatedStyle2,
      animatedStyle3,
      animatedStyle4,
    ];
  }, [
    animatedStyle0,
    animatedStyle1,
    animatedStyle2,
    animatedStyle3,
    animatedStyle4,
  ]);

  return (
    <View style={[styles.container, { height: "100%", width: "100%" }]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { opacity: visibleLayers.base ? 1 : 0 },
          { zIndex: 1 },
        ]}
        pointerEvents={visibleLayers.base ? "auto" : "none"}
      >
        <BaseCanvas
          initialScale={initialScale}
          onSizeChange={onCanvasSizeChange}
          isActive={activeCanvas === "base"}
          onDragStart={() => handleCanvasDragStart("base")}
          onSelect={() => handleCanvasSelect("base")}
        />
      </View>

      <View
        style={[
          StyleSheet.absoluteFill,
          { opacity: visibleLayers.content ? 1 : 0 },
          { zIndex: 2 },
        ]}
        pointerEvents={visibleLayers.content ? "auto" : "none"}
      >
        <ContentCanvas
          initialScale={initialScale}
          isActive={activeCanvas === "content"}
          onDragStart={() => handleCanvasDragStart("content")}
          onSelect={() => handleCanvasSelect("content")}
        />
      </View>

      {/* 按照zIndex排序所有用户创建的图层 */}
      {[...drawingLayers, ...stickerLayers]
        .filter((layerId) => layers[layerId])
        .sort((a, b) => (layers[a]?.zIndex || 0) - (layers[b]?.zIndex || 0))
        .map((layerId) => {
          // 绘画图层
          if (drawingLayers.includes(layerId)) {
            const layer = layers[layerId];
            if (!layer || layer.type !== LayerType.DRAWING) return null;

            // 查找对应的手势状态
            const gestureState = drawingGestureStates[layerId];
            if (!gestureState) return null;

            const { gesture } = gestureState;
            // 查找对应的动画样式
            const index = drawingLayers.indexOf(layerId);
            const animatedStyle =
              index >= 0 && index < MAX_DRAWING_LAYERS
                ? animatedStyles[index]
                : undefined;
            if (!animatedStyle) return null;

            // 查找对应的选择框样式
            const selectionStyle = 
              index >= 0 && index < MAX_DRAWING_LAYERS
                ? selectionFrameStyles[index]
                : undefined;
            if (!selectionStyle) return null;

            // 处理删除绘画图层
            const handleDeleteDrawing = () => {
              // 如果当前活动画布是要删除的图层，则将活动画布设置为"base"
              if (activeCanvas === layerId) {
                setActiveCanvas("base");
              }
              // 删除图层
              deleteLayer(layerId);
            };

            // 获取预先计算的边界
            const bounds = pathBounds[layerId] || { width: 100, height: 100 };
            const frameWidth = bounds.width;
            const frameHeight = bounds.height;

            return (
              <View
                key={layerId}
                style={[
                  StyleSheet.absoluteFill,
                  { opacity: visibleLayers[layerId] !== false ? 1 : 0 },
                  // 使用图层自身的zIndex加上基础值
                  { zIndex: 10 + (layer.zIndex || 0) },
                ]}
                pointerEvents={activeCanvas === layerId ? "auto" : "none"}
              >
                <GestureDetector gesture={gesture}>
                  <Animated.View
                    style={[StyleSheet.absoluteFill, animatedStyle]}
                  >
                    <Canvas style={StyleSheet.absoluteFill}>
                      {layer.paths.map((path) => (
                        <Path
                          key={path.id}
                          path={generateSvgPath(path.points)}
                          color={path.color}
                          style="stroke"
                          strokeWidth={path.strokeWidth}
                          strokeCap="round"
                          strokeJoin="round"
                          opacity={path.opacity}
                        />
                      ))}
                    </Canvas>
                  </Animated.View>
                </GestureDetector>
                
                {/* 使用SelectionFrame替换简单边框，并设置为实际内容大小 */}
                {activeCanvas === layerId && (
                  <Animated.View 
                    style={selectionStyle}
                    pointerEvents="box-none"
                  >
                    <SelectionFrame
                      position={dummyPosition}
                      width={frameWidth}
                      height={frameHeight}
                      rotation={dummyRotation}
                      scale={dummyScale}
                      onDelete={handleDeleteDrawing}
                      onRotate={() => {}}
                      onResize={() => {}}
                      onEdit={() => {}}
                    />
                  </Animated.View>
                )}
              </View>
            );
          }
          // 贴纸图层
          else {
            const layer = layers[layerId];
            if (!layer) return null;

            return (
              <View
                key={layerId}
                style={[
                  StyleSheet.absoluteFill,
                  { opacity: visibleLayers[layerId] !== false ? 1 : 0 },
                  // 使用图层自身的zIndex加上基础值
                  { zIndex: 10 + (layer.zIndex || 0) },
                ]}
                pointerEvents="box-none"
              >
                <StickerCanvas
                  layerId={layerId}
                  initialScale={initialScale}
                  isActive={activeCanvas === layerId}
                  onSelect={setActiveCanvas}
                  onDelete={(id) => {
                    if (activeCanvas === id) {
                      setActiveCanvas("base");
                    }
                  }}
                />
              </View>
            );
          }
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
});
