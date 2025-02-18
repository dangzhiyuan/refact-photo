import { Layer } from "../types/layer";

export const isPointInLayer = (x: number, y: number, layer: Layer): boolean => {
  const { transform } = layer;
  const { position, scale, rotation } = transform;

  // 转换点击坐标到图层本地坐标系
  const localPoint = transformPoint({ x, y }, position, scale, rotation);

  // 根据图层类型判断点是否在图层内
  switch (layer.type) {
    case "image":
      return isPointInImage(localPoint, layer);
    case "text":
      return isPointInText(localPoint, layer);
    // ... 其他图层类型
    default:
      return false;
  }
};

// 坐标转换函数
const transformPoint = (
  point: { x: number; y: number },
  position: { x: number; y: number },
  scale: number,
  rotation: number
) => {
  // 实现点的逆变换，将全局坐标转换为图层本地坐标
  // ...
  return { x: 0, y: 0 }; // 返回转换后的坐标
};
