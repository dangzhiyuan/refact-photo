import { Canvas } from "@shopify/react-native-skia";
import { FC, useMemo, useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";
import { colors } from "../../constants/colors";
import { getCanvasDimensions } from "../../constants/layout";
import { useLayerStore } from "../../store/useLayerStore";
import { GuideLines } from "./components/GuideLines";
import { LayerRenderer } from "./layers/LayerRenderer";
import { useCanvasGestures } from "../../hooks/canvas/useCanvasGestures";

export const CanvasView: FC = () => {
  const { selectedLayerId, updateLayer } = useLayerStore();

  const { gesture, scale, offset, isActive } = useCanvasGestures({
    enabled: !!selectedLayerId, // 只在选中图层时启用手势
    onTransformEnd: (transform) => {
      if (selectedLayerId) {
        updateLayer(selectedLayerId, { transform });
      }
    },
  });

  const dimensions = useMemo(() => getCanvasDimensions(), []);
  const [showCrossLine, setShowCrossLine] = useState(false);

  useAnimatedReaction(
    () => isActive.value,
    (active) => {
      runOnJS(setShowCrossLine)(active);
    }
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value.x },
      { translateY: offset.value.y },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={[styles.container, { height: dimensions.containerHeight }]}>
      <View
        style={[
          styles.canvasWrapper,
          {
            width: dimensions.canvasWidth,
            height: dimensions.canvasHeight,
          },
        ]}
      >
        {/* 1. 刻度画布 */}
        <View style={styles.axisContainer} pointerEvents="none">
          <Canvas style={styles.guideCanvas}>
            <GuideLines
              width={dimensions.canvasWidth}
              height={dimensions.canvasHeight}
              showCrossLine={false}
              showAxis={false}
              step={50}
            />
          </Canvas>
        </View>

        {/* 2. 图层渲染画布 */}
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.gestureContainer, animatedStyle]}>
            <Canvas style={styles.canvas}>
              <LayerRenderer />
            </Canvas>
          </Animated.View>
        </GestureDetector>

        {/* 3. 顶部参考线画布 */}
        <View style={styles.guideContainer} pointerEvents="none">
          <Canvas style={styles.guideCanvas}>
            <GuideLines
              width={dimensions.canvasWidth}
              height={dimensions.canvasHeight}
              showCrossLine={showCrossLine}
              showAxis={false}
              step={50}
            />
          </Canvas>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.windowBk,
    width: "100%",
    paddingTop: 20,
  },
  canvasWrapper: {
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.whiteBk,
    alignSelf: "center",
    borderRadius: 8,
  },
  axisContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0, // 放在最底层
  },
  gestureContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1, // 图层在中间
  },
  canvas: {
    width: "100%",
    height: "100%",
  },
  guideContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100, // 参考线在最上层
  },
  guideCanvas: {
    width: "100%",
    height: "100%",
  },
});
