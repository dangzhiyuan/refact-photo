declare module "react-native-sortable-list" {
  import { Component } from "react";
  import { StyleProp, ViewStyle } from "react-native";

  interface SortableListProps {
    data: { [key: string]: any };
    order?: string[];
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    renderRow: (params: {
      data: any;
      active: boolean;
      rowData: { index: number; key: string; data: any };
    }) => JSX.Element;
    onChangeOrder?: (nextOrder: string[]) => void;
    onActivateRow?: (key: string) => void;
    onReleaseRow?: (key: string, currentOrder: string[]) => void;
    onPressRow?: (key: string) => void;
    renderHeader?: () => JSX.Element;
    renderFooter?: () => JSX.Element;
    sortingEnabled?: boolean;
    scrollEnabled?: boolean;
    manuallyActivateRows?: boolean;
    autoscrollAreaSize?: number;
    rowActivationTime?: number;
    showsVerticalScrollIndicator?: boolean;
  }

  export default class SortableList extends Component<SortableListProps> {}
}
