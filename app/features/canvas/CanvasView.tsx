import React, { FC, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Canvas, Group, Image } from "@shopify/react-native-skia";
import { GestureDetector } from "react-native-gesture-handler";
import { colors } from "../../constants/colors";
import { CANVAS_AREA, getCanvasDimensions } from "../../constants/layout";
import { calculateFitSize } from "../../utils/layoutUtils";
import { useImageStore } from "../../store/useImageStore";
import { useCanvasGestures } from "./hooks/useCanvasGestures";
import Animated, {
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";
import { GuideLines } from "./components/GuideLines";

export const CanvasView: FC = () => {
  const { selectedImage } = useImageStore();
  const { gesture, scale, offset, isActive } = useCanvasGestures();
  const dimensions = useMemo(() => getCanvasDimensions(), []);
  const [showCrossLine, setShowCrossLine] = useState(false);

  useAnimatedReaction(
    () => isActive.value,
    (active) => {
      runOnJS(setShowCrossLine)(active);
      console.log("isActive changed to:", active);
    }
  );

  const fitSize = useMemo(() => {
    if (selectedImage) {
      return calculateFitSize(selectedImage.width(), selectedImage.height());
    }
    return null;
  }, [selectedImage]);

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
        {/* 第一个canvas */}
        <Canvas style={[styles.guideCanvas]}>
          {selectedImage && fitSize && showCrossLine && (
            <GuideLines
              width={dimensions.canvasWidth}
              height={dimensions.canvasHeight}
              showCrossLine={true}
              showAxis={true}
              step={50}
            />
          )}
        </Canvas>

        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.gestureContainer, animatedStyle]}>
            <Canvas style={styles.canvas}>
              <Group>
                {selectedImage && fitSize && (
                  <Image
                    image={selectedImage}
                    fit="contain"
                    width={fitSize.width}
                    height={fitSize.height}
                    x={fitSize.x}
                    y={fitSize.y}
                  />
                )}
              </Group>
            </Canvas>
          </Animated.View>
        </GestureDetector>
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
  gestureContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  canvas: {
    width: "100%",
    height: "100%",
  },
  guideCanvas: {
    position: "absolute",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 0,
  },
});
