// 定义绘图相关的类型

// 画笔类型枚举
export enum BrushType {
  Normal = 'normal',
  BlackBorder = 'black_border',
  Eraser = 'eraser',
  // 其他画笔类型...
}

// 路径点类型
export type PathPoint = {
  x: number;
  y: number;
  path?: any; // 这里使用any替代SkPath以避免引入Skia依赖
};

// 绘制路径类型
export type DrawingPath = {
  id: string;
  points: PathPoint[];
  path?: any; // 同样使用any替代SkPath
  color: string;
  width: number;
  // 可以添加更多属性用于特殊效果
  blendMode?: string;
  brushType?: string;
}; 