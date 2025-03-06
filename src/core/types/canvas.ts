export enum CanvasType {
  BASE = "base",
  CONTENT = "content",
  DRAWING = "drawing",
  CONTROL = "control",
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
  stickerUri: string;
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
}

export type Layer = ImageLayer | TextLayer | StickerLayer | DrawingLayer;
