import { useCallback } from "react";
import { useCanvasStore } from "../store/useCanvasStore";

export const useCanvas = () => {
  const { layers, selectedLayerId, setSelectedLayerId } = useCanvasStore();

  const selectLayer = useCallback(
    (id: string | null) => {
      setSelectedLayerId(id);
    },
    [setSelectedLayerId]
  );

  return {
    layers,
    selectedLayerId,
    selectLayer,
  };
};
