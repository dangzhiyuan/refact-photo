import { create } from "zustand";
import { nanoid } from 'nanoid';

// 贴纸数据类型
export type StickerData = {
  id: string;
  uri: string;
  position: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
};

// 贴纸状态类型
interface StickerState {
  // 贴纸列表
  stickers: StickerData[];
  // 当前选中的贴纸ID
  selectedStickerId: string | null;
  
  // 添加贴纸
  addSticker: (uri: string, position?: Partial<StickerData['position']>) => string;
  // 更新贴纸位置
  updateStickerPosition: (id: string, position: Partial<StickerData['position']>) => void;
  // 删除贴纸
  removeSticker: (id: string) => void;
  // 选择贴纸
  selectSticker: (id: string | null) => void;
}

export const useStickerStore = create<StickerState>((set, get) => ({
  stickers: [],
  selectedStickerId: null,
  
  // 添加新贴纸
  addSticker: (uri, position = {}) => {
    const id = nanoid();
    const defaultPosition = {
      x: 100,
      y: 200,
      scale: 1,
      rotation: 0
    };
    
    set(state => ({
      stickers: [
        ...state.stickers,
        {
          id,
          uri,
          position: { ...defaultPosition, ...position }
        }
      ],
      selectedStickerId: id
    }));
    
    return id;
  },
  
  // 更新贴纸位置
  updateStickerPosition: (id, position) => {
    set(state => ({
      stickers: state.stickers.map(sticker => 
        sticker.id === id 
          ? { ...sticker, position: { ...sticker.position, ...position } }
          : sticker
      )
    }));
  },
  
  // 删除贴纸
  removeSticker: (id) => {
    set(state => ({
      stickers: state.stickers.filter(sticker => sticker.id !== id),
      selectedStickerId: state.selectedStickerId === id ? null : state.selectedStickerId
    }));
  },
  
  // 选择贴纸
  selectSticker: (id) => {
    set({ selectedStickerId: id });
  }
})); 