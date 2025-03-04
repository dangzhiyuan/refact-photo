/**
 * 限制画布最大尺寸，保持宽高比
 */
export const limitCanvasSize = (
  width: number,
  height: number,
  maxDimension = 1920
) => {
  // 如果尺寸在合理范围内，直接返回
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  // 计算宽高比
  const aspectRatio = width / height;

  // 根据宽高比例计算新尺寸
  if (width > height) {
    return {
      width: maxDimension,
      height: Math.round(maxDimension / aspectRatio),
    };
  } else {
    return {
      width: Math.round(maxDimension * aspectRatio),
      height: maxDimension,
    };
  }
};
