import { Layer } from "./layer";
import { SharedValue } from "react-native-reanimated";

export interface LayerRendererProps {
  layer: Layer;
  isSelected: boolean;
  opacity?: SharedValue<number>;
  children?: React.ReactNode;
}

export type LayerRenderer = React.ComponentType<LayerRendererProps>;
