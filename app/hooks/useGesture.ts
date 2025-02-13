import { useCallback } from "react";
import { Gesture } from "react-native-gesture-handler";
import { useCanvasStore } from "../store/useCanvasStore";

export const useGesture = () => {
  const { selectedLayerId, moveLayer, transformLayer } = useCanvasStore();

  const createPanGesture = useCallback(() => {
    return Gesture.Pan();
  }, []);

  const createPinchGesture = useCallback(() => {
    return Gesture.Pinch();
  }, []);

  return {
    createPanGesture,
    createPinchGesture,
  };
};
