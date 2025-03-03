import { Layer, ImageLayer, TextLayer } from "../types/layer";
import { getCanvasDimensions } from "../constants/layout";
import { calculateFitSize } from "./layoutUtils";

interface Point {
  x: number;
  y: number;
}

export const isPointInLayer = (x: number, y: number, layer: Layer): boolean => {
  const { transform } = layer;
  const { position, scale, rotation } = transform;

  // 转换点击坐标到图层本地坐标系
  const localPoint = transformPoint({ x, y }, position, scale, rotation);

  switch (layer.type) {
    case "image":
      return isPointInBounds(localPoint, layer as ImageLayer);
    case "text":
      return isPointInBounds(localPoint, layer as TextLayer);
    case "draw":
    default:
      return false;
  }
};

const isPointInBounds = (point: Point, layer: Layer): boolean => {
  // 简单的边界框检测
  const width =
    layer.type === "image"
      ? (layer as ImageLayer).imageSource.width() * layer.transform.scale
      : 100; // 默认宽度
  const height =
    layer.type === "image"
      ? (layer as ImageLayer).imageSource.height() * layer.transform.scale
      : 100; // 默认高度

  return point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height;
};

const transformPoint = (
  point: Point,
  position: Point,
  scale: number,
  rotation: number
): Point => {
  // 1. 移动到原点
  const dx = point.x - position.x;
  const dy = point.y - position.y;

  // 2. 旋转（逆时针）
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const rx = dx * cos + dy * sin;
  const ry = -dx * sin + dy * cos;

  // 3. 缩放
  return {
    x: rx / scale,
    y: ry / scale,
  };
};

/**
 * 计算图层尺寸（用于手势处理区域）
 */
export const calculateLayerDimensions = (layer: Layer) => {
  // 根据图层类型计算尺寸
  switch (layer.type) {
    case "image":
      const imageLayer = layer as any;
      const imageSource = imageLayer.imageSource;
      if (imageSource) {
        // 使用与渲染相同的尺寸计算逻辑，但只传递2个参数
        const fitSize = calculateFitSize(
          imageSource.width(),
          imageSource.height()
        );
        return {
          width: fitSize.width,
          height: fitSize.height,
        };
      }
      return { width: 200, height: 200 };

    case "text":
      const textLayer = layer as any;
      // 文字图层尺寸可能需要根据文本内容、字体大小计算
      return { width: 200, height: 50 };

    case "draw":
      // 绘图图层尺寸，可能需要根据绘制内容计算
      return { width: 300, height: 300 };

    default:
      // 默认尺寸
      return { width: 200, height: 200 };
  }
};
