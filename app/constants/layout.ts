import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Canvas 区域配置
export const CANVAS_AREA = {
  // 画布容器
  container: {
    heightRatio: 0.55,
    width: screenWidth,
  },

  // 实际画布
  canvas: {
    widthRatio: 0.85, // 减小宽度比例，使白色背景更窄
    heightRatio: 0.95,
  },

  // 缩放限制
  scale: {
    min: 0.5,
    max: 3.0,
  },

  // 基础尺寸
  width: screenWidth,
  height: screenHeight * 0.55,
  x: 0,
  y: 0,
  padding: 10,
};

// 计算实际尺寸
export const getCanvasDimensions = () => {
  const containerHeight = screenHeight * CANVAS_AREA.container.heightRatio;
  const canvasWidth = screenWidth * CANVAS_AREA.canvas.widthRatio;
  const canvasHeight = containerHeight * CANVAS_AREA.canvas.heightRatio;

  return {
    containerHeight,
    canvasWidth,
    canvasHeight,
  };
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
  const y = CANVAS_AREA.y + (CANVAS_AREA.height - finalHeight) / 2; // 修改为正中心

  // 计算缩放比例
  const scale = finalWidth / imageWidth;

  return { width: finalWidth, height: finalHeight, x, y, scale };
};

// 菜单布局配置
export const MENU_LAYOUT = {
  // 菜单项高度
  itemHeight: 44,
  // 菜单项内边距
  itemPadding: 12,
  // 图标大小
  iconSize: 24,
  // 子菜单缩进
  subMenuIndent: 16,
  // 分隔线高度
  dividerHeight: 1,
};
