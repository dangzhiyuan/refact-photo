import { PathPoint } from "../types/drawing";
import { SkPath } from "@shopify/react-native-skia";

// 计算点之间的距离
export const getDistance = (p1: PathPoint, p2: PathPoint): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// 创建平滑的路径算法
export const createSmoothPath = (points: PathPoint[], path: any, tension: number = 0.3): void => {
  if (!points || points.length < 2) return;
  
  // 清空现有路径并重新开始
  path.reset();
  
  // 移动到第一个点
  path.moveTo(points[0].x, points[0].y);
  
  if (points.length === 2) {
    // 只有两个点时直接连线
    path.lineTo(points[1].x, points[1].y);
    return;
  }
  
  // 使用贝塞尔曲线创建平滑路径
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    
    // 计算控制点距离
    const controlLen = getDistance(prev, next) * tension;
    
    // 计算控制点
    const controlPoint1X = curr.x - controlLen * (next.x - prev.x) / getDistance(prev, next);
    const controlPoint1Y = curr.y - controlLen * (next.y - prev.y) / getDistance(prev, next);
    
    const controlPoint2X = curr.x;
    const controlPoint2Y = curr.y;
    
    // 绘制贝塞尔曲线
    path.cubicTo(
      controlPoint1X, controlPoint1Y,
      controlPoint2X, controlPoint2Y,
      curr.x, curr.y
    );
  }
  
  // 连接到最后一个点
  path.lineTo(points[points.length - 1].x, points[points.length - 1].y);
}; 