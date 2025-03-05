// 画布类型
export enum CanvasType {
  BASE = "base",
  CONTENT = "content",
  DRAWING = "drawing",
  CONTROL = "control",
}

// 基础图层接口
export interface BaseLayer {
  id: string;
  type: LayerType;
  zIndex: number;
  visible: boolean;
  opacity: number;
  transform: Transform;
}

// 变换接口
export interface Transform {
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

// 图层类型
export enum LayerType {
  IMAGE = "image",
  TEXT = "text",
  STICKER = "sticker",
  DRAWING = "drawing",
}

// 图像图层
export interface ImageLayer extends BaseLayer {
  type: LayerType.IMAGE;
  imageUri: string;
  filter?: string;
  filterIntensity?: number;
  adjustments?: ImageAdjustments;
}

// 文本图层
export interface TextLayer extends BaseLayer {
  type: LayerType.TEXT;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  alignment: "left" | "center" | "right";
}

// 贴纸图层
export interface StickerLayer extends BaseLayer {
  type: LayerType.STICKER;
  stickerUri: string;
}

// 绘图图层
export interface DrawingLayer extends BaseLayer {
  type: LayerType.DRAWING;
  paths: DrawingPath[];
}

// 绘图路径
export interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
}

// 图像调整参数
export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  vignette: number;
}

// 编辑模式
export enum EditorMode {
  VIEW = "view",
  EDIT = "edit",
  DRAW = "draw",
  TEXT = "text",
  FILTER = "filter",
}

// 统一图层类型
export type Layer = ImageLayer | TextLayer | StickerLayer | DrawingLayer;
