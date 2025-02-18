declare module "react-native-dnd-list" {
  import { Component } from "react";
  import { StyleProp, ViewStyle } from "react-native";

  interface DraggableListProps<T> {
    data: T[];
    keyExtractor: (item: T) => string;
    renderItem: (props: {
      item: T;
      index: number;
      isDragging: boolean;
    }) => React.ReactNode;
    onReorderEnd?: (fromIndex: number, toIndex: number) => void;
    style?: StyleProp<ViewStyle>;
  }

  export default class DraggableList<T> extends Component<
    DraggableListProps<T>
  > {}
}
