export type ToolType = "filter" | "adjustment" | "text" | "layers" | null;

export interface Tool {
  id: string;
  icon: string;
  label: string;
  type: ToolType;
  disabled?: boolean;
}
