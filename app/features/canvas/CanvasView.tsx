import { useCallback, useMemo } from "react";
import { Canvas } from "@shopify/react-native-skia";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { useCanvasStore } from "../../store/useCanvasStore";
import { View, Dimensions } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  useAnimatedReaction,
} from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { LayerFactory } from "./layers/LayerFactory";
import { ImageLayer } from "../../types/layer";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const CanvasView = () => {
  const {
    layers,
    selectedLayerId,
    setSelectedLayerId,
    moveLayer,
    transformLayer,
  } = useCanvasStore();

  // 添加错误检查
  if (!layers || !Array.isArray(layers)) {
    console.error("Invalid layers data:", layers);
    return null;
  }

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

  // 使用 useAnimatedReaction 处理点击检测
  const handleTap = useCallback((x: number, y: number, scaleValue: number, offsetValue: { x: number; y: number }) => {
    try {
      console.log("Canvas tap:", { x, y });

      // 考虑缩放和偏移后的坐标
      const adjustedX = (x - offsetValue.x) / scaleValue;
      const adjustedY = (y - offsetValue.y) / scaleValue;

      const clickedLayer = [...layers].reverse().find((layer) => {
        if (!layer || !layer.position) {
          return false;
        }
        const { x: layerX, y: layerY } = layer.position;
        const layerWidth = layer.type === 'image' 
          ? (layer as ImageLayer).imageWidth * layer.scale 
          : screenWidth * layer.scale;
        const layerHeight = layer.type === 'image'
          ? (layer as ImageLayer).imageHeight * layer.scale
          : screenHeight * layer.scale;

        return (
          adjustedX >= layerX &&
          adjustedX <= layerX + layerWidth &&
          adjustedY >= layerY &&
          adjustedY <= layerY + layerHeight
        );
      });

      setSelectedLayerId(clickedLayer?.id || null);
    } catch (error) {
      console.error("Error in handleTap:", error);
    }
  }, [layers, setSelectedLayerId]);

  // 创建手势
  const gestures = useMemo(() => {
    const dragGesture = Gesture.Pan()
      .averageTouches(true)
      .onUpdate((e) => {
        try {
          offset.value = {
            x: e.translationX + start.value.x,
            y: e.translationY + start.value.y,
          };
        } catch (error) {
          console.error("Error in drag update:", error);
        }
      })
      .onEnd(() => {
        try {
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
        } catch (error) {
          console.error("Error in drag end:", error);
        }
      });

    const zoomGesture = Gesture.Pinch()
      .onUpdate((e) => {
        try {
          const newScale = savedScale.value * e.scale;
          scale.value = Math.min(Math.max(0.1, newScale), 5);
        } catch (error) {
          console.error("Error in zoom update:", error);
        }
      })
      .onEnd(() => {
        try {
          savedScale.value = scale.value;
          if (selectedLayerId) {
            runOnJS(transformLayer)(selectedLayerId, scale.value, 0);
          }
        } catch (error) {
          console.error("Error in zoom end:", error);
        }
      });

    const tapGesture = Gesture.Tap().onStart((e) => {
      "worklet";
      const currentScale = scale.value;
      const currentOffset = offset.value;
      runOnJS(handleTap)(e.absoluteX, e.absoluteY, currentScale, currentOffset);
    });

    return Gesture.Simultaneous(dragGesture, zoomGesture, tapGesture);
  }, [selectedLayerId, handleTap, moveLayer, transformLayer]);

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      <GestureDetector gesture={gestures}>
        <Animated.View 
          style={[
            { 
              flex: 1,
              width: screenWidth,
              height: screenHeight,
            }, 
            animatedStyles
          ]}
        >
          <Canvas 
            style={{ 
              flex: 1,
              width: '100%',
              height: '100%',
              backgroundColor: "#fff" 
            }}
          >
            {layers.map((layer) => {
              if (!layer || !layer.id) {
                console.error("Invalid layer:", layer);
                return null;
              }
              
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
