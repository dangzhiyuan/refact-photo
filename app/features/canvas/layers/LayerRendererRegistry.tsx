import { useEffect } from "react";
import { useLayerRendererStore } from "../../../store/useLayerRendererStore";
import { ImageLayerRenderer } from "./renderers/ImageLayerRenderer";
import { TextLayerRenderer } from "./renderers/TextLayerRenderer";
import { DrawLayerRenderer } from "./renderers/DrawLayerRenderer";

export const LayerRendererRegistry = () => {
  const registerRenderer = useLayerRendererStore(
    (state) => state.registerRenderer
  );

  useEffect(() => {
    registerRenderer("image", ImageLayerRenderer);
    registerRenderer("text", TextLayerRenderer);
    registerRenderer("draw", DrawLayerRenderer);
  }, [registerRenderer]);

  return null;
};
