import { useMemo } from "react";
import { useCanvasGestures } from "./useCanvasGestures";

const MAX_DRAWING_LAYERS = 5;

export const useDrawingGestures = (
  drawingLayers: string[],
  onDragStart: (layerId: string) => void
) => {
  // 在顶层调用 hooks
  const gesture0 = useCanvasGestures({
    contentWidth: 0,
    contentHeight: 0,
    initialScale: 1,
    autoFit: false,
    onDragStart: () => {
      if (drawingLayers[0]) {
        onDragStart(drawingLayers[0]);
      }
    },
  });

  const gesture1 = useCanvasGestures({
    contentWidth: 0,
    contentHeight: 0,
    initialScale: 1,
    autoFit: false,
    onDragStart: () => {
      if (drawingLayers[1]) {
        onDragStart(drawingLayers[1]);
      }
    },
  });

  const gesture2 = useCanvasGestures({
    contentWidth: 0,
    contentHeight: 0,
    initialScale: 1,
    autoFit: false,
    onDragStart: () => {
      if (drawingLayers[2]) {
        onDragStart(drawingLayers[2]);
      }
    },
  });

  const gesture3 = useCanvasGestures({
    contentWidth: 0,
    contentHeight: 0,
    initialScale: 1,
    autoFit: false,
    onDragStart: () => {
      if (drawingLayers[3]) {
        onDragStart(drawingLayers[3]);
      }
    },
  });

  const gesture4 = useCanvasGestures({
    contentWidth: 0,
    contentHeight: 0,
    initialScale: 1,
    autoFit: false,
    onDragStart: () => {
      if (drawingLayers[4]) {
        onDragStart(drawingLayers[4]);
      }
    },
  });

  // 返回所有手势状态
  return [gesture0, gesture1, gesture2, gesture3, gesture4];
};
