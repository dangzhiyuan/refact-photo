import { create } from "zustand";
import { LayerType } from "../types/layer";
import type { LayerRenderer } from "../types/renderer";

interface LayerRendererState {
  renderers: Map<LayerType, LayerRenderer>;
  registerRenderer: (type: LayerType, renderer: LayerRenderer) => void;
  getRenderer: (type: LayerType) => LayerRenderer | null;
}

export const useLayerRendererStore = create<LayerRendererState>((set, get) => ({
  renderers: new Map(),

  registerRenderer: (type, renderer) =>
    set((state) => {
      const newRenderers = new Map(state.renderers);
      newRenderers.set(type, renderer);
      return { renderers: newRenderers };
    }),

  getRenderer: (type) => {
    return get().renderers.get(type) || null;
  },
}));
