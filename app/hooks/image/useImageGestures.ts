import { Gesture } from "react-native-gesture-handler";
import { useImageStore } from "../../store/useImageStore";

export const useImageGestures = () => {
  const { transform, setTransform } = useImageStore();

  const gesture = Gesture.Pan().onUpdate((e) => {
    setTransform({
      ...transform,
      position: {
        x: transform.position.x + e.translationX,
        y: transform.position.y + e.translationY,
      },
    });
  });

  return { gesture };
};
