import { Layer } from '../types/layer';

export interface CanvasStore {
  layers: Layer[];
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  moveLayer: (id: string, position: { x: number; y: number }) => void;
  transformLayer: (id: string, scale: number, rotation: number) => void;
  addLayer: (layer: Layer) => void;
} 