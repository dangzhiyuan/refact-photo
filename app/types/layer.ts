import { SkImage, Path, SkPath, BlendMode } from "@shopify/react-native-skia";
import { LutType } from "../assets/luts";

export type LayerType = "image" | "text" | "draw" | "filter";

export interface Transform {
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

export interface Adjustments {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  exposure?: number;
  hue?: number;
  temperature?: number;
  tint?: number;
  highlights?: number;
  shadows?: number;
  sharpness?: number;
}

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  isVisible: boolean;
  opacity: number;
  blendMode: BlendMode;
  transform: Transform;
  zIndex: number;
}

export interface ImageLayer extends BaseLayer {
  type: "image";
  imageSource: any;
  filterType: LutType;
  filterIntensity: number;
  adjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
  name: string;
}

export interface TextLayer extends BaseLayer {
  type: "text";
  text: string;
  font?: string;
  fontSize: number;
  color: string;
}

export interface DrawLayer extends BaseLayer {
  type: "draw";
  paths: SkPath[];
  color: string;
  strokeWidth: number;
}

export type Layer = ImageLayer | TextLayer | DrawLayer;
