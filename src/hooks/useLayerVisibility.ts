import { useState } from "react";

export const useLayerVisibility = (
  initialState = {
    base: true,
    drawing: true,
    content: true,
    control: true,
  }
) => {
  const [visibleLayers, setVisibleLayers] = useState(initialState);

  const toggleLayerVisibility = (layerId) => {
    setVisibleLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  return {
    visibleLayers,
    toggleLayerVisibility,
    setLayerVisibility: (layerId, isVisible) => {
      setVisibleLayers((prev) => ({
        ...prev,
        [layerId]: isVisible,
      }));
    },
  };
};
