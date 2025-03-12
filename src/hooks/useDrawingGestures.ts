import { useCanvasGestures } from "./useCanvasGestures";
import { useCanvasStore } from "../store/canvasStore";
import { useEffect, useRef } from "react";
import { LayerType } from "../core/types/canvas";

// 定义变换状态的接口
interface TransformState {
  scale: number;
  position: {
    x: number;
    y: number;
  };
}

export const useDrawingGestures = (
  drawingLayers: string[],
  onDragStart: (layerId: string) => void
) => {
  const { layers, transformLayer } = useCanvasStore();

  // 创建对每个图层当前变换状态的引用，以避免在hook之间的闭包问题
  const layerTransforms = useRef<Record<string, TransformState>>({});

  // 当图层变化时，确保我们有最新的变换状态
  useEffect(() => {
    drawingLayers.forEach((layerId) => {
      const layer = layers[layerId];
      if (layer && layer.type === LayerType.DRAWING) {
        layerTransforms.current[layerId] = {
          scale: layer.transform?.scale || 1,
          position: {
            x: layer.transform?.position?.x || 0,
            y: layer.transform?.position?.y || 0,
          },
        };
      }
    });
  }, [layers, drawingLayers]);

  // 创建处理变换结束的函数
  const createTransformEndHandler = (layerIndex: number) => {
    return (transform: { scale: number; x: number; y: number }) => {
      const layerId = drawingLayers[layerIndex];
      if (!layerId) return;

      // 更新我们的引用
      layerTransforms.current[layerId] = {
        scale: transform.scale,
        position: { x: transform.x, y: transform.y },
      };

      // 保存到store
      console.log(`保存图层${layerId}变换:`, transform);
      transformLayer(layerId, {
        scale: transform.scale,
        position: { x: transform.x, y: transform.y },
      });
    };
  };

  // 创建获取初始状态的函数
  const getLayerInitialScale = (layerIndex: number): number => {
    const layerId = drawingLayers[layerIndex];
    if (!layerId) return 1;

    const transform = layerTransforms.current[layerId];
    if (transform) {
      return transform.scale;
    }

    const layer = layers[layerId];
    if (
      layer &&
      layer.type === LayerType.DRAWING &&
      layer.transform &&
      layer.transform.scale
    ) {
      return layer.transform.scale;
    }

    return 1;
  };

  // 创建获取初始位置的函数
  const getLayerInitialOffset = (
    layerIndex: number
  ): { x: number; y: number } => {
    const layerId = drawingLayers[layerIndex];
    if (!layerId) return { x: 0, y: 0 };

    const transform = layerTransforms.current[layerId];
    if (transform) {
      return transform.position;
    }

    const layer = layers[layerId];
    if (
      layer &&
      layer.type === LayerType.DRAWING &&
      layer.transform &&
      layer.transform.position
    ) {
      return {
        x: layer.transform.position.x,
        y: layer.transform.position.y,
      };
    }

    return { x: 0, y: 0 };
  };

  const gesture0 = useCanvasGestures({
    contentWidth: 0,
    contentHeight: 0,
    initialScale: getLayerInitialScale(0),
    initialOffset: getLayerInitialOffset(0),
    autoFit: false,
    onDragStart: () => {
      if (drawingLayers[0]) {
        onDragStart(drawingLayers[0]);
      }
    },
    onTransformEnd: createTransformEndHandler(0),
  });

  const gesture1 = useCanvasGestures({
    contentWidth: 0,
    contentHeight: 0,
    initialScale: getLayerInitialScale(1),
    initialOffset: getLayerInitialOffset(1),
    autoFit: false,
    onDragStart: () => {
      if (drawingLayers[1]) {
        onDragStart(drawingLayers[1]);
      }
    },
    onTransformEnd: createTransformEndHandler(1),
  });

  const gesture2 = useCanvasGestures({
    contentWidth: 0,
    contentHeight: 0,
    initialScale: getLayerInitialScale(2),
    initialOffset: getLayerInitialOffset(2),
    autoFit: false,
    onDragStart: () => {
      if (drawingLayers[2]) {
        onDragStart(drawingLayers[2]);
      }
    },
    onTransformEnd: createTransformEndHandler(2),
  });

  const gesture3 = useCanvasGestures({
    contentWidth: 0,
    contentHeight: 0,
    initialScale: getLayerInitialScale(3),
    initialOffset: getLayerInitialOffset(3),
    autoFit: false,
    onDragStart: () => {
      if (drawingLayers[3]) {
        onDragStart(drawingLayers[3]);
      }
    },
    onTransformEnd: createTransformEndHandler(3),
  });

  const gesture4 = useCanvasGestures({
    contentWidth: 0,
    contentHeight: 0,
    initialScale: getLayerInitialScale(4),
    initialOffset: getLayerInitialOffset(4),
    autoFit: false,
    onDragStart: () => {
      if (drawingLayers[4]) {
        onDragStart(drawingLayers[4]);
      }
    },
    onTransformEnd: createTransformEndHandler(4),
  });

  // 返回所有手势状态
  return [gesture0, gesture1, gesture2, gesture3, gesture4];
};
