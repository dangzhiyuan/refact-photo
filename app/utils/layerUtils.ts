import { Layer, ImageLayer, TextLayer } from "../types/layer";

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
    case "filter":
      return isPointInBounds(localPoint, layer);
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
