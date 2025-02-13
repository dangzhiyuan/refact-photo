import { Canvas } from "@shopify/react-native-skia";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { useCanvasStore } from "../../store/useCanvasStore";
import { View, Dimensions } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { LayerFactory } from "./layers/LayerFactory";
import { useCallback } from "react";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const CanvasView = () => {
  const {
    layers,
    selectedLayerId,
    setSelectedLayerId,
    moveLayer,
    transformLayer,
  } = useCanvasStore();

  // 使用 shared values 来处理变换
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const offset = useSharedValue({ x: 0, y: 0 });
  const start = useSharedValue({ x: 0, y: 0 });

  // 创建动画样式
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value.x },
      { translateY: offset.value.y },
      { scale: scale.value },
    ],
  }));

  // 处理点击选择
  const handleTap = useCallback(
    (x: number, y: number) => {
      console.log("Canvas tap:", { x, y });

      const clickedLayer = [...layers].reverse().find((layer) => {
        const { x: layerX, y: layerY } = layer.position;
        const layerWidth = screenWidth * layer.scale;
        const layerHeight = screenHeight * layer.scale;
        return (
          x >= layerX &&
          x <= layerX + layerWidth &&
          y >= layerY &&
          y <= layerY + layerHeight
        );
      });

      console.log("Layer selection:", {
        clickedLayerId: clickedLayer?.id,
        previousSelectedId: selectedLayerId,
      });

      setSelectedLayerId(clickedLayer?.id || null);
    },
    [layers, setSelectedLayerId]
  );

  // 基础手势
  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      "worklet";
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    })
    .onEnd(() => {
      "worklet";
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
      if (selectedLayerId) {
        runOnJS(moveLayer)(selectedLayerId, {
          x: offset.value.x,
          y: offset.value.y,
        });
      }
    });

  const zoomGesture = Gesture.Pinch()
    .onUpdate((e) => {
      "worklet";
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      "worklet";
      savedScale.value = scale.value;
      if (selectedLayerId) {
        runOnJS(transformLayer)(selectedLayerId, scale.value, 0);
      }
    });

  const tapGesture = Gesture.Tap().onStart((e) => {
    "worklet";
    runOnJS(handleTap)(e.absoluteX, e.absoluteY);
  });

  const gesture = Gesture.Simultaneous(dragGesture, zoomGesture, tapGesture);

  console.log("Current layers:", layers);

  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[{ flex: 1 }, animatedStyles]}>
          <Canvas style={{ flex: 1, backgroundColor: "#fff" }}>
            {layers.map((layer, index) => {
              console.log(`Layer ${index}:`, {
                id: layer.id,
                type: layer.type,
                key: layer.id,
              });
              return (
                <LayerFactory
                  key={`layer-${layer.id}`}
                  layer={layer}
                  isSelected={layer.id === selectedLayerId}
                />
              );
            })}
          </Canvas>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
