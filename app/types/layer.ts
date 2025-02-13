export interface BaseLayer {
  id: string;
  type: 'image' | 'text' | 'draw';
  position: {
    x: number;
    y: number;
  };
  scale: number;
  rotation: number;
  opacity: number;
}

export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  imageSource: string;
  filterType?: string;
  filterIntensity?: number;
  adjustments?: Adjustments;
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
