export interface BaseLayer {
  id: string;
  type: LayerType;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  opacity: number;
}

export type LayerType = "image" | "text" | "draw";

export interface ImageLayer extends BaseLayer {
  type: "image";
  imageSource?: string;
  filterType?: string;
  filterIntensity?: number;
}

export interface TextLayer extends BaseLayer {
  type: "text";
  text: string;
  fontSize: number;
  color: string;
  font?: string;
  alignment: "left" | "center" | "right";
  lineHeight?: number;
}

export interface DrawLayer extends BaseLayer {
  type: "draw";
  paths: { x: number; y: number }[][];
}

export type Layer = ImageLayer | TextLayer | DrawLayer;
