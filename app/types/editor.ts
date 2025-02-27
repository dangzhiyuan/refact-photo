export type PanelType = "draw" | "layers" | "filter" | "adjust" | "text";

export interface EditorState {
  activePanel: PanelType | null;
  selectedTool: PanelType | null;
  // ... 其他编辑器状态
}
