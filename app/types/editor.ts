export type PanelType = "filter" | "adjust" | "text" | "layer";

export interface EditorState {
  activePanel: PanelType | null;
  selectedTool: string | null;
  // ... 其他编辑器状态
}
