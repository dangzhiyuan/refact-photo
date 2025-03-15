import React, { useMemo, useCallback, useEffect } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from "react-native";
import { BaseCanvas } from "./canvas/BaseCanvas";
import { ContentCanvas } from "./canvas/ContentCanvas";
import { StickerCanvas } from "./canvas/StickerCanvas";
import { LayerVisibility } from "../hooks/useLayerVisibility";
import { useCanvasStore } from "../store/canvasStore";
import { LayerType, DrawingPath } from "../core/types/canvas";
import { Canvas, Path } from "@shopify/react-native-skia";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, useAnimatedReaction } from "react-native-reanimated";
import { useDrawingGestures } from "../hooks/useDrawingGestures";
import { SelectionFrame } from "./common/SelectionFrame";
import { MAX_DRAWING_LAYERS } from "../core/constants";

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

  // 为每个可能的绘画图层预创建位置共享值（直接在顶层创建，不在useMemo中）
  const adjustedPosition0 = useSharedValue({ x: 0, y: 0 });
  const adjustedPosition1 = useSharedValue({ x: 0, y: 0 });
  const adjustedPosition2 = useSharedValue({ x: 0, y: 0 });
  const adjustedPosition3 = useSharedValue({ x: 0, y: 0 });
  const adjustedPosition4 = useSharedValue({ x: 0, y: 0 });
  
  // 合并到一个数组中
  const adjustedPositions = useMemo(() => {
    return [
      adjustedPosition0,
      adjustedPosition1,
      adjustedPosition2,
      adjustedPosition3,
      adjustedPosition4,
    ];
  }, [
    adjustedPosition0,
    adjustedPosition1,
    adjustedPosition2,
    adjustedPosition3,
    adjustedPosition4,
  ]);

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

  // 设置每个图层的位置反应
  useEffect(() => {
    drawingLayers.forEach((layerId, index) => {
      if (index < MAX_DRAWING_LAYERS && gestureStates[index]) {
        const bounds = pathBounds[layerId] || { x: 0, y: 0, width: 100, height: 100 };
        const position = adjustedPositions[index];
        
        // 立即更新位置
        position.value = {
          x: gestureStates[index].offset.value.x + bounds.x,
          y: gestureStates[index].offset.value.y + bounds.y
        };
      }
    });
  }, [drawingLayers, gestureStates, pathBounds, adjustedPositions]);

  // 为每个预定义的位置创建独立的 useAnimatedReaction
  useAnimatedReaction(
    () => {
      if (!gestureStates[0]) return null;
      const layerId = drawingLayers[0];
      if (!layerId) return null;
      const bounds = pathBounds[layerId] || { x: 0, y: 0, width: 100, height: 100 };
      return { 
        offset: gestureStates[0].offset.value, 
        bounds, 
        scale: gestureStates[0].scale.value 
      };
    },
    (result) => {
      if (!result) return;
      // 注意：我们这里直接传递原始坐标，因为SelectionFrame会作为独立元素渲染
      // 但我们需要考虑缩放对边界的影响
      adjustedPosition0.value = {
        x: result.offset.x + result.bounds.x * result.scale,
        y: result.offset.y + result.bounds.y * result.scale
      };
    }
  );

  useAnimatedReaction(
    () => {
      if (!gestureStates[1]) return null;
      const layerId = drawingLayers[1];
      if (!layerId) return null;
      const bounds = pathBounds[layerId] || { x: 0, y: 0, width: 100, height: 100 };
      return { 
        offset: gestureStates[1].offset.value, 
        bounds, 
        scale: gestureStates[1].scale.value 
      };
    },
    (result) => {
      if (!result) return;
      adjustedPosition1.value = {
        x: result.offset.x + result.bounds.x * result.scale,
        y: result.offset.y + result.bounds.y * result.scale
      };
    }
  );

  useAnimatedReaction(
    () => {
      if (!gestureStates[2]) return null;
      const layerId = drawingLayers[2];
      if (!layerId) return null;
      const bounds = pathBounds[layerId] || { x: 0, y: 0, width: 100, height: 100 };
      return { 
        offset: gestureStates[2].offset.value, 
        bounds, 
        scale: gestureStates[2].scale.value 
      };
    },
    (result) => {
      if (!result) return;
      adjustedPosition2.value = {
        x: result.offset.x + result.bounds.x * result.scale,
        y: result.offset.y + result.bounds.y * result.scale
      };
    }
  );

  useAnimatedReaction(
    () => {
      if (!gestureStates[3]) return null;
      const layerId = drawingLayers[3];
      if (!layerId) return null;
      const bounds = pathBounds[layerId] || { x: 0, y: 0, width: 100, height: 100 };
      return { 
        offset: gestureStates[3].offset.value, 
        bounds, 
        scale: gestureStates[3].scale.value 
      };
    },
    (result) => {
      if (!result) return;
      adjustedPosition3.value = {
        x: result.offset.x + result.bounds.x * result.scale,
        y: result.offset.y + result.bounds.y * result.scale
      };
    }
  );

  useAnimatedReaction(
    () => {
      if (!gestureStates[4]) return null;
      const layerId = drawingLayers[4];
      if (!layerId) return null;
      const bounds = pathBounds[layerId] || { x: 0, y: 0, width: 100, height: 100 };
      return { 
        offset: gestureStates[4].offset.value, 
        bounds, 
        scale: gestureStates[4].scale.value 
      };
    },
    (result) => {
      if (!result) return;
      adjustedPosition4.value = {
        x: result.offset.x + result.bounds.x * result.scale,
        y: result.offset.y + result.bounds.y * result.scale
      };
    }
  );

  // 定义所有动画样式Hooks (在组件顶层直接定义)
  const animatedStyle0 = useAnimatedStyle(() => {
    if (!gestureStates[0]) return {};
    return {
      transform: [
        { translateX: gestureStates[0].offset.value.x },
        { translateY: gestureStates[0].offset.value.y },
        { scale: gestureStates[0].scale.value },
      ],
    };
  }, [gestureStates]);
  
  const animatedStyle1 = useAnimatedStyle(() => {
    if (!gestureStates[1]) return {};
    return {
      transform: [
        { translateX: gestureStates[1].offset.value.x },
        { translateY: gestureStates[1].offset.value.y },
        { scale: gestureStates[1].scale.value },
      ],
    };
  }, [gestureStates]);
  
  const animatedStyle2 = useAnimatedStyle(() => {
    if (!gestureStates[2]) return {};
    return {
      transform: [
        { translateX: gestureStates[2].offset.value.x },
        { translateY: gestureStates[2].offset.value.y },
        { scale: gestureStates[2].scale.value },
      ],
    };
  }, [gestureStates]);
  
  const animatedStyle3 = useAnimatedStyle(() => {
    if (!gestureStates[3]) return {};
    return {
      transform: [
        { translateX: gestureStates[3].offset.value.x },
        { translateY: gestureStates[3].offset.value.y },
        { scale: gestureStates[3].scale.value },
      ],
    };
  }, [gestureStates]);
  
  const animatedStyle4 = useAnimatedStyle(() => {
    if (!gestureStates[4]) return {};
    return {
      transform: [
        { translateX: gestureStates[4].offset.value.x },
        { translateY: gestureStates[4].offset.value.y },
        { scale: gestureStates[4].scale.value },
      ],
    };
  }, [gestureStates]);
  
  // 使用useMemo将样式组合成数组，这里不调用任何Hooks
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

            // 创建考虑边界框的位置共享值
            const adjustedPosition = adjustedPositions[index];
            
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
                    
                    {/* 选择框放在同一个变换容器内 */}
                    {activeCanvas === layerId && (
                      <View 
                        style={{
                          position: 'absolute',
                          left: bounds.x,
                          top: bounds.y,
                          width: frameWidth,
                          height: frameHeight,
                          pointerEvents: 'none'
                        }}
                      >
                        <View
                          style={{
                            borderWidth: 2,
                            borderColor: '#34C759',
                            borderStyle: 'dashed',
                            borderRadius: 4,
                            width: '100%',
                            height: '100%'
                          }}
                        />
                        {/* 删除按钮 */}
                        <TouchableOpacity 
                          style={{
                            position: 'absolute',
                            top: -15,
                            right: -15,
                            width: 30,
                            height: 30,
                            backgroundColor: '#FF3B30',
                            borderRadius: 15,
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onPress={handleDeleteDrawing}
                        >
                          <Text style={{color: 'white', fontSize: 18}}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </Animated.View>
                </GestureDetector>
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
