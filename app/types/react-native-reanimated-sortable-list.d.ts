declare module "react-native-reanimated-sortable-list" {
  import { Component } from "react";
  import { StyleProp, ViewStyle } from "react-native";

  interface SortableListProps<T> {
    data: T[];
    keyExtractor: (item: T) => string;
    renderItem: (props: {
      item: T;
      index: number;
      drag: () => void;
      isActive: boolean;
    }) => React.ReactNode;
    onSortEnd: (params: { from: number; to: number }) => void;
    animationConfig?: {
      damping?: number;
      stiffness?: number;
      mass?: number;
      overshootClamping?: boolean;
    };
    containerStyle?: StyleProp<ViewStyle>;
  }

  export default class SortableList<T> extends Component<
    SortableListProps<T>
  > {}
}
