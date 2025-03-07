import type { SkMatrix, Vector } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";

// 定义矩阵索引常量
// Skia 矩阵是一个 3x3 矩阵，按照列顺序存储在一个一维数组中
const MatrixIndex = {
  ScaleX: 0, // [0][0]
  SkewX: 1, // [1][0]
  TransX: 2, // [2][0]
  SkewY: 3, // [0][1]
  ScaleY: 4, // [1][1]
  TransY: 5, // [2][1]
  Persp0: 6, // [0][2]
  Persp1: 7, // [1][2]
  Persp2: 8, // [2][2]
};

/**
 * 对矩阵应用缩放变换
 */
export const scale = (matrix: SkMatrix, s: number, origin: Vector) => {
  "worklet";
  const source = Skia.Matrix(matrix.get());
  source.translate(origin.x, origin.y);
  source.scale(s, s);
  source.translate(-origin.x, -origin.y);
  return source;
};

/**
 * 对矩阵应用旋转变换
 */
export const rotateZ = (matrix: SkMatrix, theta: number, origin: Vector) => {
  "worklet";
  const source = Skia.Matrix(matrix.get());
  source.translate(origin.x, origin.y);
  source.rotate(theta);
  source.translate(-origin.x, -origin.y);
  return source;
};

/**
 * 对矩阵应用平移变换
 */
export const translate = (matrix: SkMatrix, x: number, y: number) => {
  "worklet";
  const m = Skia.Matrix();
  m.translate(x, y);
  m.concat(matrix);
  return m;
};

/**
 * 将 3x3 矩阵转换为 React Native 所需的 4x4 变换矩阵
 */
export const toM4 = (m3: SkMatrix) => {
  "worklet";
  const m = m3.get();
  const tx = m[MatrixIndex.TransX];
  const ty = m[MatrixIndex.TransY];
  const sx = m[MatrixIndex.ScaleX];
  const sy = m[MatrixIndex.ScaleY];
  const skewX = m[MatrixIndex.SkewX];
  const skewY = m[MatrixIndex.SkewY];
  const persp0 = m[MatrixIndex.Persp0];
  const persp1 = m[MatrixIndex.Persp1];
  const persp2 = m[MatrixIndex.Persp2];

  return [
    sx,
    skewY,
    persp0,
    0,
    skewX,
    sy,
    persp1,
    0,
    0,
    0,
    1,
    0,
    tx,
    ty,
    persp2,
    1,
  ];
};
