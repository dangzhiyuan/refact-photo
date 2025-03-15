import { useCanvasGestures } from "./useCanvasGestures";
import { useCanvasStore } from "../store/canvasStore";
import { useRef } from "react";
import { LayerType } from "../core/types/canvas";
import { createFixedSizeGestureHook } from "./createGestureFactory";
import { MAX_DRAWING_LAYERS } from "../core/constants";

// 定义变换状态的接口
interface TransformState {
  scale: number;
  position: {
    x: number;
    y: number;
  };
}

/**
 * 为单个绘画图层创建手势处理
 * 这个函数将被工厂函数重复调用
 */
const createLayerGesture = (
  index: number, 
  layerId: string | undefined, 
  onDragStart: (layerId: string) => void
) => {
  const { layers, transformLayer } = useCanvasStore();
  
  // 创建对每个图层当前变换状态的引用，以避免在hook之间的闭包问题
  const layerTransformRef = useRef<TransformState>({
    scale: 1,
    position: { x: 0, y: 0 }
  });
  
  // 如果layerId存在，获取初始变换状态
  if (layerId) {
    const layer = layers[layerId];
    if (layer && layer.type === LayerType.DRAWING) {
      layerTransformRef.current = {
        scale: layer.transform?.scale || 1,
        position: {
          x: layer.transform?.position?.x || 0,
          y: layer.transform?.position?.y || 0,
        },
      };
    }
  }
  
  // 获取初始缩放值
  const getInitialScale = (): number => {
    if (!layerId) return 1;
    
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
  
  // 获取初始位置
  const getInitialOffset = (): { x: number; y: number } => {
    if (!layerId) return { x: 0, y: 0 };
    
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
  
  // 创建手势处理结束的回调
  const handleTransformEnd = (transform: { scale: number; x: number; y: number }) => {
    if (!layerId) return;
    
    // 更新引用
    layerTransformRef.current = {
      scale: transform.scale,
      position: { x: transform.x, y: transform.y },
    };
    
    // 保存到store
    transformLayer(layerId, {
      scale: transform.scale,
      position: { x: transform.x, y: transform.y },
    });
  };
  
  // 创建手势
  return useCanvasGestures({
    contentWidth: 0,
    contentHeight: 0,
    initialScale: getInitialScale(),
    initialOffset: getInitialOffset(),
    autoFit: false,
    onDragStart: () => {
      if (layerId) {
        onDragStart(layerId);
      }
    },
    onTransformEnd: handleTransformEnd,
  });
};

// 使用工厂函数创建处理多个图层的钩子
export const useDrawingGestures = createFixedSizeGestureHook(
  MAX_DRAWING_LAYERS,
  createLayerGesture
);
