import { Dimensions } from "react-native";
import { CANVAS_AREA } from "../constants/layout";

interface Size {
  width: number;
  height: number;
}

// 计算适应屏幕的尺寸
export const calculateFitSize = (
  imageWidth: number,
  imageHeight: number
): Size => {
  const canvasWidth = CANVAS_AREA.width;
  const canvasHeight = CANVAS_AREA.height;

  // 计算宽高比
  const imageRatio = imageWidth / imageHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let finalWidth: number;
  let finalHeight: number;

  if (imageRatio > canvasRatio) {
    // 图片更宽，以画布宽度为准
    finalWidth = canvasWidth * 0.8; // 留出一些边距
    finalHeight = finalWidth / imageRatio;
  } else {
    // 图片更高，以画布高度为准
    finalHeight = canvasHeight * 0.8; // 留出一些边距
    finalWidth = finalHeight * imageRatio;
  }

  return {
    width: finalWidth,
    height: finalHeight,
  };
};

// 计算居中位置
export const calculateCenterPosition = (
  contentWidth: number,
  contentHeight: number,
  containerWidth: number,
  containerHeight: number
) => {
  return {
    x: (containerWidth - contentWidth) / 2,
    y: (containerHeight - contentHeight) / 2,
  };
};
