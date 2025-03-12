import React, { useCallback, useState, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
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

type Point = {
  x: number;
  y: number;
};

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width,
  height,
  onLayerCreated,
}) => {
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const { currentBrush } = useDrawingStore();
  const { addLayer } = useCanvasStore();
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const currentMode = useEditorStore((state) => state.currentMode);
  const modeRef = useRef<EditorMode>(currentMode);
  const pathsRef = useRef<DrawingPath[]>([]);
  const isFirstRender = useRef(true);

  // 更新 pathsRef
  useEffect(() => {
    pathsRef.current = paths;
    console.log("Paths updated:", paths.length);
  }, [paths]);

  // 在组件卸载时检查是否需要创建图层
  useEffect(() => {
    return () => {
      console.log(
        "DrawingCanvas unmounting, paths count:",
        pathsRef.current.length
      );
      if (pathsRef.current.length > 0) {
        console.log("Creating drawing layer on unmount");
        try {
          const layerId = addLayer({
            type: LayerType.DRAWING,
            zIndex: 0,
            visible: true,
            opacity: 1,
            transform: {
              position: { x: 0, y: 0 },
              scale: 1,
              rotation: 0,
            },
            paths: [...pathsRef.current],
          } as DrawingLayer);

          console.log("Created layer with ID on unmount:", layerId);
          if (onLayerCreated) {
            onLayerCreated(layerId);
          }
        } catch (error) {
          console.error("Error creating drawing layer on unmount:", error);
        }
      }
    };
  }, [addLayer, onLayerCreated]);

  // 监听绘画模式的变化
  useEffect(() => {
    // 跳过第一次渲染
    if (isFirstRender.current) {
      isFirstRender.current = false;
      modeRef.current = currentMode;
      return;
    }

    const prevMode = modeRef.current;
    console.log("Mode changed:", {
      prevMode,
      currentMode,
      pathsCount: pathsRef.current.length,
    });

    // 只有在进入绘画模式时才清空路径
    if (prevMode !== EditorMode.DRAW && currentMode === EditorMode.DRAW) {
      console.log("Entering draw mode, clearing paths");
      setPaths([]);
      pathsRef.current = [];
    }

    modeRef.current = currentMode;
  }, [currentMode]);

  const onStart = useCallback(
    (point: Point) => {
      console.log("Starting new path");
      const newPath: DrawingPath = {
        id: Math.random().toString(),
        points: [point],
        color: currentBrush.color || "#000000",
        strokeWidth: currentBrush.strokeWidth || 4,
        opacity: currentBrush.opacity,
        brushType: currentBrush.type,
        brushSettings: currentBrush.settings,
      };
      setCurrentPath(newPath);
    },
    [currentBrush]
  );

  const onActive = useCallback(
    (point: Point) => {
      if (currentPath) {
        setCurrentPath({
          ...currentPath,
          points: [...currentPath.points, point],
        });
      }
    },
    [currentPath]
  );

  const onEnd = useCallback(() => {
    if (currentPath && currentPath.points.length >= 2) {
      console.log("Ending path with points:", currentPath.points.length);
      // 将当前路径添加到路径集合中
      setPaths((prevPaths) => [...prevPaths, currentPath]);
    }
    setCurrentPath(null);
  }, [currentPath]);

  const gestureHandler =
    useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
      onStart: (event) => {
        const point = { x: event.x, y: event.y };
        runOnJS(onStart)(point);
      },
      onActive: (event) => {
        const point = { x: event.x, y: event.y };
        runOnJS(onActive)(point);
      },
      onEnd: () => {
        runOnJS(onEnd)();
      },
    });

  // 如果不在绘画模式，不渲染任何内容
  if (currentMode !== EditorMode.DRAW) {
    return null;
  }

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={StyleSheet.absoluteFill}>
        <Canvas style={[styles.canvas, { width, height }]}>
          {paths.map((path) => (
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
          {currentPath && (
            <Path
              path={generateSvgPath(currentPath.points)}
              color={currentPath.color}
              style="stroke"
              strokeWidth={currentPath.strokeWidth}
              strokeCap="round"
              strokeJoin="round"
              opacity={currentPath.opacity}
            />
          )}
        </Canvas>
      </Animated.View>
    </PanGestureHandler>
  );
};

const generateSvgPath = (points: Point[]): string => {
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

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});
