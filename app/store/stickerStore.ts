import { create } from "zustand";

export interface Sticker {
  id: string;
  imagePath: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

interface StickerState {
  stickers: Sticker[];

  addSticker: (imagePath: string) => void;
  removeSticker: (id: string) => void;
  updateStickerTransform: (
    id: string,
    transform: Partial<Pick<Sticker, "position" | "scale" | "rotation">>
  ) => void;
}

export const useStickerStore = create<StickerState>((set) => ({
  stickers: [],

  addSticker: (imagePath) => {
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}`,
      imagePath,
      position: { x: 100, y: 100 }, // 初始位置
      scale: 1,
      rotation: 0,
    };

    set((state) => ({
      stickers: [...state.stickers, newSticker],
    }));
  },

  removeSticker: (id) =>
    set((state) => ({
      stickers: state.stickers.filter((sticker) => sticker.id !== id),
    })),

  updateStickerTransform: (id, transform) =>
    set((state) => ({
      stickers: state.stickers.map((sticker) =>
        sticker.id === id
          ? {
              ...sticker,
              position: transform.position || sticker.position,
              scale:
                transform.scale !== undefined ? transform.scale : sticker.scale,
              rotation:
                transform.rotation !== undefined
                  ? transform.rotation
                  : sticker.rotation,
            }
          : sticker
      ),
    })),
}));
