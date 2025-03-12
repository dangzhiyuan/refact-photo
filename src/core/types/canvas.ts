export enum CanvasType {
  BASE = "base",
  CONTENT = "content",
  DRAWING = "drawing",
  CONTROL = "control",
  STICKER = "sticker",
}

export interface BaseLayer {
  id: string;
  type: LayerType;
  zIndex: number;
  visible: boolean;
  opacity: number;
  transform: Transform;
}

export interface Transform {
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

export enum LayerType {
  IMAGE = "image",
  TEXT = "text",
  STICKER = "sticker",
  DRAWING = "drawing",
}

export interface ImageLayer extends BaseLayer {
  type: LayerType.IMAGE;
  imageUri: string;
  filter?: string;
  filterIntensity?: number;
  adjustments?: ImageAdjustments;
}

export interface TextLayer extends BaseLayer {
  type: LayerType.TEXT;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  alignment: "left" | "center" | "right";
}

export interface StickerLayer extends BaseLayer {
  type: LayerType.STICKER;
  stickerUri: string; // 网络贴纸的 URI
  width: number;
  height: number;
  isLocalSticker?: boolean; // 是否是本地贴纸
  localStickerSource?: any; // 本地贴纸的资源引用
  matrix?: any;
}

export interface DrawingLayer extends BaseLayer {
  type: LayerType.DRAWING;
  paths: DrawingPath[];
}

export interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  opacity: number;
  brushType: BrushType;
  brushSettings?: BrushSettings;
}

export enum BrushType {
  NORMAL = "normal",
  SOFT = "soft",
  NEON = "neon",
  MOSAIC = "mosaic",
  BLUR = "blur",
  ERASER = "eraser",
}

export interface BrushSettings {
  // 柔和画笔的羽化程度
  softness?: number;
  // 霓虹笔的发光强度
  glowIntensity?: number;
  // 马赛克的块大小
  mosaicSize?: number;
  // 模糊强度
  blurRadius?: number;
}

export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  vignette: number;
}

export enum EditorMode {
  VIEW = "view",
  EDIT = "edit",
  DRAW = "draw",
  TEXT = "text",
  FILTER = "filter",
  LAYER = "layer",
  STICKER = "sticker",
}

export type Layer = ImageLayer | TextLayer | StickerLayer | DrawingLayer;
