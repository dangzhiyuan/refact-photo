declare module "react-native-draggable-grid" {
  import { Component } from "react";
  import { StyleProp, ViewStyle } from "react-native";

  interface DraggableGridProps<T> {
    numColumns: number;
    data: T[];
    renderItem: (item: T) => React.ReactNode;
    style?: StyleProp<ViewStyle>;
    itemHeight: number;
    dragStartAnimation?: {
      transform?: Array<{ [key: string]: number }>;
      shadow?: boolean;
      scale?: number;
    };
    onDragStart?: (fromIndex: number) => void;
    onDragRelease?: (data: T[]) => void;
    onResetSort?: () => void;
  }

  export default class DraggableGrid<T> extends Component<
    DraggableGridProps<T>
  > {}
}
