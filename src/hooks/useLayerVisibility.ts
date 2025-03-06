import { useState } from "react";

export type LayerVisibility = Record<string, boolean>;

export const DEFAULT_LAYERS = ["base", "drawing", "content", "control"];

interface UseLayerVisibilityReturn {
  visibleLayers: LayerVisibility;
  toggleLayerVisibility: (layerId: string) => void;
  setLayerVisibility: (layerId: string, isVisible: boolean) => void;
  resetLayerVisibility: () => void;
}

/**
 * 图层可见性管理钩子
 * @param initialState 可选的初始状态，未提供时使用默认值
 * @returns 图层可见性状态和操作函数
 */
export function useLayerVisibility(
  initialState?: LayerVisibility
): UseLayerVisibilityReturn {
  const defaultState: LayerVisibility = initialState || {
    base: true,
    drawing: true,
    content: true,
    control: true,
  };

  const [visibleLayers, setVisibleLayers] =
    useState<LayerVisibility>(defaultState);

  /**
   * 切换指定图层的可见性
   * @param layerId 图层ID
   */
  const toggleLayerVisibility = (layerId: string): void => {
    setVisibleLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  /**
   * 设置指定图层的可见性
   * @param layerId 图层ID
   * @param isVisible 是否可见
   */
  const setLayerVisibility = (layerId: string, isVisible: boolean): void => {
    setVisibleLayers((prev) => ({
      ...prev,
      [layerId]: isVisible,
    }));
  };

  /**
   * 重置所有图层到初始可见状态
   */
  const resetLayerVisibility = (): void => {
    setVisibleLayers(defaultState);
  };

  return {
    visibleLayers,
    toggleLayerVisibility,
    setLayerVisibility,
    resetLayerVisibility,
  };
}
