import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { CanvasManager } from "../CanvasManager";
import LinearGradient from "react-native-linear-gradient";
import { COLORS } from "../../theme/colors";

interface CanvasViewportProps {
  activeCanvas: string;
  setActiveCanvas: (canvasType: string) => void;
  initialScale?: number;

  // 添加自定义样式属性
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  useGradient?: boolean;
  gradientColors?: string[];
  elevation?: number;
  shadowProps?: {
    shadowColor?: string;
    shadowOffset?: { width: number; height: number };
    shadowOpacity?: number;
    shadowRadius?: number;
  };
  borderStyle?: "corners" | "none";
  fitScale?: number; // 控制初始适配的比例 (0-1)
  visibleLayers?: {
    base: boolean;
    drawing: boolean;
    content: boolean;
    control: boolean;
  };
  onCanvasSizeChange: (size: { width: number; height: number }) => void;
}

// 获取屏幕尺寸
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 视口高度固定为屏幕高度的55%
const VIEWPORT_HEIGHT = SCREEN_HEIGHT * 0.55;

// 圆角边框装饰
const BorderDecorator = () => (
  <>
    <View style={styles.topLeftCorner} />
    <View style={styles.topRightCorner} />
    <View style={styles.bottomLeftCorner} />
    <View style={styles.bottomRightCorner} />
  </>
);

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  activeCanvas,
  setActiveCanvas,
  initialScale = 0.8,
  backgroundColor = COLORS.canvasBackground,
  borderRadius = 15,
  padding = 0,
  paddingHorizontal = 0,
  paddingVertical = 0,
  useGradient,
  gradientColors,
  elevation,
  shadowProps,
  borderStyle = "none",
  fitScale = 0.85,
  visibleLayers = { base: true, drawing: true, content: true, control: true },
  onCanvasSizeChange,
}) => {
  const viewportStyle = {
    ...styles.viewport,
    backgroundColor,
    borderRadius,
    padding: padding > 0 ? padding : undefined,
    paddingHorizontal: paddingHorizontal > 0 ? paddingHorizontal : undefined,
    paddingVertical: paddingVertical > 0 ? paddingVertical : undefined,
  };

  useEffect(() => {
    // 这里可以添加逻辑，将初始偏移信息传递给Canvas组件
    // 例如通过Context或全局状态
  }, []);

  return (
    <View style={[viewportStyle, shadowProps, { elevation: elevation || 0 }]}>
      {useGradient && gradientColors ? (
        <LinearGradient colors={gradientColors} style={styles.gradient}>
          <View style={styles.canvasContainer}>
            <CanvasManager
              activeCanvas={activeCanvas}
              setActiveCanvas={setActiveCanvas}
              initialScale={initialScale}
              fitScale={fitScale}
              visibleLayers={visibleLayers}
              onCanvasSizeChange={onCanvasSizeChange}
            />
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.canvasContainer}>
          <CanvasManager
            activeCanvas={activeCanvas}
            setActiveCanvas={setActiveCanvas}
            initialScale={initialScale}
            fitScale={fitScale}
            visibleLayers={visibleLayers}
            onCanvasSizeChange={onCanvasSizeChange}
          />
        </View>
      )}

      {borderStyle === "corners" && <BorderDecorator />}
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  viewport: {
    width: "100%",
    // 移除固定高度
    // height: VIEWPORT_HEIGHT,
    height: "100%", // 使用100%高度
    position: "relative",
    overflow: "hidden",
  },
  canvasContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  gradient: {
    width: "100%",
    height: "100%",
  },
  topLeftCorner: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: COLORS.accent + "40", // 使用半透明粉色
    borderTopLeftRadius: 5,
  },
  topRightCorner: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(52, 120, 246, 0.4)", // 使用半透明蓝色
    borderTopRightRadius: 5,
  },
  bottomLeftCorner: {
    position: "absolute",
    bottom: 10,
    left: 10,
    width: 20,
    height: 20,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "rgba(52, 120, 246, 0.4)", // 使用半透明蓝色
    borderBottomLeftRadius: 5,
  },
  bottomRightCorner: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 20,
    height: 20,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(52, 120, 246, 0.4)", // 使用半透明蓝色
    borderBottomRightRadius: 5,
  },
});
