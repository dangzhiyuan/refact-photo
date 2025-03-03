import { create } from "zustand";
import { ToolType } from "../types/tools";

interface EditorState {
  mode: "image" | "draw" | "text";
  activeTool: ToolType | null;
  setMode: (mode: EditorState["mode"]) => void;
  setActiveTool: (tool: ToolType | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  mode: "image",
  activeTool: null,
  setMode: (mode) => set({ mode }),
  setActiveTool: (tool) => set({ activeTool: tool }),
}));
