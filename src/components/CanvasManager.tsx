import React, { useMemo, useCallback, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { BaseCanvas } from "./canvas/BaseCanvas";
import { ContentCanvas } from "./canvas/ContentCanvas";
import { StickerCanvas } from "./canvas/StickerCanvas";
import { LayerVisibility } from "../hooks/useLayerVisibility";
import { useCanvasStore } from "../store/canvasStore";
import { LayerType } from "../core/types/canvas";
import { Canvas, Path } from "@shopify/react-native-skia";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useDrawingGestures } from "../hooks/useDrawingGestures";

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

  // 使用自定义 hook 获取手势状态
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

  // 初始化手势状态的值
  useEffect(() => {
    drawingLayers.forEach((layerId, index) => {
      if (index < gestureStates.length) {
        const layer = layers[layerId];
        if (
          layer &&
          layer.type === LayerType.DRAWING &&
          layer.transform &&
          layer.transform.scale
        ) {
          const gestureState = gestureStates[index];
          if (gestureState && gestureState.scale) {
            // 安全地更新值
            gestureState.scale.value = layer.transform.scale;
          }
        }
      }
    });
  }, [drawingLayers, gestureStates, layers]);

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

      {/* 渲染绘画图层 */}
      {drawingLayers.map((layerId, index) => {
        if (index >= MAX_DRAWING_LAYERS) return null;

        const layer = layers[layerId];
        if (!layer || layer.type !== LayerType.DRAWING) return null;

        const { gesture } = drawingGestureStates[layerId];
        const animatedStyle = animatedStyles[index];

        return (
          <View
            key={layerId}
            style={[
              StyleSheet.absoluteFill,
              { opacity: visibleLayers[layerId] !== false ? 1 : 0 },
              { zIndex: 3 },
            ]}
            pointerEvents={activeCanvas === layerId ? "auto" : "none"}
          >
            <GestureDetector gesture={gesture}>
              <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
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
                {activeCanvas === layerId && (
                  <View
                    style={{
                      ...StyleSheet.absoluteFillObject,
                      borderWidth: 2,
                      borderColor: "rgba(52, 120, 246, 0.4)",
                      borderRadius: 4,
                    }}
                  />
                )}
              </Animated.View>
            </GestureDetector>
          </View>
        );
      })}

      {/* 渲染贴纸图层 */}
      {stickerLayers.map((layerId) => (
        <View
          key={layerId}
          style={[
            StyleSheet.absoluteFill,
            { opacity: visibleLayers[layerId] !== false ? 1 : 0 },
            { zIndex: 4 },
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
      ))}
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
