export function calculateFitSize(
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number,
  scaleFactor = 0.95
) {
  const imageRatio = imageWidth / imageHeight;
  const containerRatio = containerWidth / containerHeight;

  let finalWidth: number;
  let finalHeight: number;

  if (imageRatio > containerRatio) {
    // 图片更宽，基于容器宽度
    finalWidth = containerWidth * scaleFactor;
    finalHeight = finalWidth / imageRatio;
  } else {
    // 图片更高，基于容器高度
    finalHeight = containerHeight * scaleFactor;
    finalWidth = finalHeight * imageRatio;
  }

  return { width: finalWidth, height: finalHeight };
}
