import { useCallback } from "react";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useCanvasStore } from "../store/canvasStore";
import { CanvasType, Layer } from "../core/types/canvas";

export const useCanvasGesture = (canvasType: CanvasType) => {
  const { moveLayer, transformLayer, selectLayer, selectedLayerId, layers } =
    useCanvasStore();

  // 点击选择手势
  const tapGesture = useCallback(() => {
    return Gesture.Tap().onStart((e) => {
      // 检测点击位置是否在某个图层上
      const hitLayerId = findLayerAtPoint(e.x, e.y, layers);

      if (hitLayerId) {
        runOnJS(selectLayer)(hitLayerId);
      } else {
        runOnJS(selectLayer)(null);
      }
    });
  }, [layers, selectLayer]);

  // 平移手势
  const panGesture = useCallback(() => {
    return Gesture.Pan()
      .onStart(() => {
        // 可以添加开始状态处理
      })
      .onChange((e) => {
        if (selectedLayerId) {
          // 更新选中图层位置
          const layer = layers[selectedLayerId];
          if (layer) {
            const newPosition = {
              x: layer.transform.position.x + e.changeX,
              y: layer.transform.position.y + e.changeY,
            };
            runOnJS(moveLayer)(selectedLayerId, newPosition);
          }
        }
      });
  }, [selectedLayerId, layers, moveLayer]);

  // 组合缩放和旋转手势
  const pinchRotateGesture = useCallback(() => {
    return Gesture.Simultaneous(
      // 缩放手势
      Gesture.Pinch().onChange((e) => {
        if (selectedLayerId) {
          const layer = layers[selectedLayerId];
          if (layer) {
            runOnJS(transformLayer)(selectedLayerId, {
              scale: layer.transform.scale * e.scaleChange,
            });
          }
        }
      }),

      // 旋转手势
      Gesture.Rotation().onChange((e) => {
        if (selectedLayerId) {
          const layer = layers[selectedLayerId];
          if (layer) {
            runOnJS(transformLayer)(selectedLayerId, {
              rotation: layer.transform.rotation + e.rotationChange,
            });
          }
        }
      })
    );
  }, [selectedLayerId, layers, transformLayer]);

  // 根据画布类型返回适当的手势
  const getCanvasGesture = useCallback(() => {
    switch (canvasType) {
      case CanvasType.CONTENT:
      case CanvasType.CONTROL:
        // 内容和控制层需要完整的交互手势
        return Gesture.Simultaneous(
          tapGesture(),
          Gesture.Exclusive(pinchRotateGesture(), panGesture())
        );

      case CanvasType.DRAWING:
        // 绘图层有自己的手势处理，修复这里的错误
        // 返回一个不会触发的手势，代替 None()
        return Gesture.Tap().enabled(false);

      case CanvasType.BASE:
      default:
        // 基础层只需要点击处理
        return tapGesture();
    }
  }, [canvasType, tapGesture, panGesture, pinchRotateGesture]);

  return getCanvasGesture();
};

// 辅助函数：查找点击位置的图层
const findLayerAtPoint = (
  x: number,
  y: number,
  layers: Record<string, Layer>
) => {
  // 从上到下检查图层（Z索引降序）
  const layerIds = Object.keys(layers).sort(
    (a, b) => layers[b].zIndex - layers[a].zIndex
  );

  for (const id of layerIds) {
    const layer = layers[id];
    if (!layer.visible) continue;

    // 简化的碰撞检测，实际需要更复杂的检测
    const { position, scale } = layer.transform;

    // 假设所有图层都是100x100的矩形
    const width = 100 * scale;
    const height = 100 * scale;

    if (
      x >= position.x &&
      x <= position.x + width &&
      y >= position.y &&
      y <= position.y + height
    ) {
      return id;
    }
  }

  return null;
};
