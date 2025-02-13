export type ToolType = "filter" | "template" | "draw" | "text" | "sticker";

export interface Tool {
  type: ToolType;
  icon: string;
  label: string;
}
