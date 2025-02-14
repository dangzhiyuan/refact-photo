import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// 预览区域配置
export const CANVAS_AREA = {
  x: 0,
  y: 0,
  width: screenWidth,
  height: screenHeight * 0.7, // 70% 的屏幕高度给预览区
  padding: 20,
  borderColor: "#E0E0E0",
  borderWidth: 1,
  backgroundColor: "#FFFFFF",
};

// 工具栏区域配置
export const TOOLBAR_AREA = {
  height: 80,
  bottomPadding: 20,
};

// 子工具栏配置
export const SUBTOOLBAR_AREA = {
  height: 200,
};

// 计算实际可用的预览区域尺寸
export const PREVIEW_CONTENT = {
  width: CANVAS_AREA.width - CANVAS_AREA.padding * 2,
  height: CANVAS_AREA.height - CANVAS_AREA.padding * 2,
};

// 计算图片适应预览区域的尺寸和位置
export const computeImageFit = (imageWidth: number, imageHeight: number) => {
  // 计算宽高比
  const imageRatio = imageWidth / imageHeight;
  const previewRatio = PREVIEW_CONTENT.width / PREVIEW_CONTENT.height;

  let finalWidth: number;
  let finalHeight: number;

  // 根据宽高比决定如何缩放
  if (imageRatio > previewRatio) {
    // 图片更宽，以宽度为准
    finalWidth = PREVIEW_CONTENT.width;
    finalHeight = finalWidth / imageRatio;
  } else {
    // 图片更高，以高度为准
    finalHeight = PREVIEW_CONTENT.height;
    finalWidth = finalHeight * imageRatio;
  }

  // 计算居中位置
  const x = CANVAS_AREA.x + (CANVAS_AREA.width - finalWidth) / 2;
  const y = CANVAS_AREA.y + (CANVAS_AREA.height - finalHeight) / 3; // 靠上 1/3 位置

  // 计算缩放比例
  const scale = finalWidth / imageWidth;

  return { width: finalWidth, height: finalHeight, x, y, scale };
};
