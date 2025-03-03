import { Canvas, Group } from "@shopify/react-native-skia";
import { FC, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
} from "react-native";
import { colors } from "../../constants/colors";
import { getCanvasDimensions } from "../../constants/layout";
import { useLayerStore } from "../../store/useLayerStore";
import { GuideLines } from "./components/GuideLines";
import { LayerRenderer } from "./layers/LayerRenderer";
import { LayerGestureManager } from "../../features/gestures/LayerGestureManager";
import { SelectionIndicator } from "./components/SelectionIndicator";
import { DrawGestureHandler } from "../../features/gestures/DrawGestureHandler";
import { useDrawModeStore } from "../../store/useDrawModeStore";
import { TestBox } from "../../features/gestures/TestBox";
import { useRealTimeStore } from "../../store/useRealTimeStore";
import { ErrorBoundary } from "../../components/ErrorBoundary";

export const CanvasView: FC = () => {
  const { selectedLayerId } = useLayerStore();
  const dimensions = useMemo(() => getCanvasDimensions(), []);
  const [showCrossLine, setShowCrossLine] = useState(false);
  const isDrawMode = useDrawModeStore((state) => state.isDrawMode);
  const { isRealTimeMode, toggleRealTimeMode } = useRealTimeStore();

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
        {/* 1. 刻度画布 - 底层 */}
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

        {/* 2. 图层渲染画布 - 中间层 */}
        <View style={styles.renderContainer}>
          <ErrorBoundary>
            <Canvas style={styles.canvas}>
              <Group>
                <LayerRenderer />
              </Group>
            </Canvas>
          </ErrorBoundary>
        </View>

        {/* 3. 新增：手势处理层 - 交互层 */}
        {!isDrawMode && (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <LayerGestureManager />
          </View>
        )}

        {/* 4. 绘图手势处理器 */}
        <DrawGestureHandler />

        {/* 参考线画布 - 顶层 */}
        <View style={styles.guideContainer} pointerEvents="none">
          {!isDrawMode && <SelectionIndicator />}
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

        {/* 添加测试框在最顶层 */}
        <TestBox />

        {/* 添加实时模式按钮 */}
        <TouchableOpacity
          style={[
            styles.realTimeModeButton,
            isRealTimeMode
              ? styles.realTimeModeActive
              : styles.realTimeModeInactive,
          ]}
          onPress={toggleRealTimeMode}
        >
          <Text
            style={[
              styles.realTimeModeButtonText,
              isRealTimeMode
                ? styles.realTimeModeTextActive
                : styles.realTimeModeTextInactive,
            ]}
          >
            {isRealTimeMode ? "RT" : "ST"}
          </Text>
        </TouchableOpacity>
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
  renderContainer: {
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
  realTimeModeButton: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  realTimeModeButtonText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  realTimeModeActive: {
    backgroundColor: "#81b0ff",
  },
  realTimeModeInactive: {
    backgroundColor: "#f4f3f4",
  },
  realTimeModeTextActive: {
    color: "white",
  },
  realTimeModeTextInactive: {
    color: "#666",
  },
});
