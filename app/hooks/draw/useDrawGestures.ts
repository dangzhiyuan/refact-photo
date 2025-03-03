import { Gesture } from "react-native-gesture-handler";
import { useDrawStore } from "../../store/useDrawStore";
import { Skia } from "@shopify/react-native-skia";

export const useDrawGestures = () => {
  const { color, strokeWidth, addPath, updateCurrentPath } = useDrawStore();
  let path = Skia.Path.Make();

  const gesture = Gesture.Pan()
    .onStart((e) => {
      path.moveTo(e.x, e.y);
      updateCurrentPath(path);
    })
    .onUpdate((e) => {
      path.lineTo(e.x, e.y);
      updateCurrentPath(path);
    })
    .onEnd(() => {
      addPath(path);
      path = Skia.Path.Make();
    });

  return { gesture };
};
