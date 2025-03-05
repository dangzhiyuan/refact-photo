import { create } from "zustand";

export interface TextItem {
  id: string;
  text: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  color: string;
  fontSize: number;
  fontFamily: string;
}

interface TextState {
  textItems: TextItem[];

  addText: (text: string) => void;
  removeText: (id: string) => void;
  updateTextContent: (id: string, text: string) => void;
  updateTextStyle: (
    id: string,
    style: Partial<Omit<TextItem, "id" | "position" | "scale" | "rotation">>
  ) => void;
  updateTextTransform: (
    id: string,
    transform: Partial<Pick<TextItem, "position" | "scale" | "rotation">>
  ) => void;
}

export const useTextStore = create<TextState>((set) => ({
  textItems: [],

  addText: (text) => {
    const newTextItem: TextItem = {
      id: `text-${Date.now()}`,
      text: text || "输入文字",
      position: { x: 100, y: 100 }, // 初始位置
      scale: 1,
      rotation: 0,
      color: "#000000",
      fontSize: 24,
      fontFamily: "default",
    };

    set((state) => ({
      textItems: [...state.textItems, newTextItem],
    }));
  },

  removeText: (id) =>
    set((state) => ({
      textItems: state.textItems.filter((item) => item.id !== id),
    })),

  updateTextContent: (id, text) =>
    set((state) => ({
      textItems: state.textItems.map((item) =>
        item.id === id ? { ...item, text } : item
      ),
    })),

  updateTextStyle: (id, style) =>
    set((state) => ({
      textItems: state.textItems.map((item) =>
        item.id === id ? { ...item, ...style } : item
      ),
    })),

  updateTextTransform: (id, transform) =>
    set((state) => ({
      textItems: state.textItems.map((item) =>
        item.id === id
          ? {
              ...item,
              position: transform.position || item.position,
              scale:
                transform.scale !== undefined ? transform.scale : item.scale,
              rotation:
                transform.rotation !== undefined
                  ? transform.rotation
                  : item.rotation,
            }
          : item
      ),
    })),
}));
