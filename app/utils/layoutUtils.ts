import { Dimensions } from "react-native";
import { CANVAS_AREA } from "../constants/layout";

// 计算适应屏幕的尺寸
export const calculateFitSize = (
  originalWidth: number,
  originalHeight: number
) => {
  const canvasWidth = CANVAS_AREA.width;
  const canvasHeight = CANVAS_AREA.height;

  // 计算宽高比
  const imageRatio = originalWidth / originalHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let width: number;
  let height: number;

  if (imageRatio > canvasRatio) {
    // 图片更宽，以宽度为准
    width = canvasWidth * 0.9; // 留出一些边距
    height = width / imageRatio;
  } else {
    // 图片更高，以高度为准
    height = canvasHeight * 0.9; // 留出一些边距
    width = height * imageRatio;
  }

  // 计算居中位置
  const x = (canvasWidth - width) / 2;
  const y = (canvasHeight - height) / 2;

  return {
    width,
    height,
    x,
    y,
    scale: width / originalWidth,
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
