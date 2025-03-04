import { create } from "zustand";
import { nanoid } from 'nanoid';

// 文本项类型
export type TextItem = {
  id: string;
  text: string;
  position: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
  style: {
    color: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    textAlign: 'left' | 'center' | 'right';
  };
};

// 文本状态类型
interface TextState {
  // 文本项列表
  textItems: TextItem[];
  // 当前选中的文本项ID
  selectedTextId: string | null;
  // 当前正在编辑的文本项ID
  editingTextId: string | null;
  
  // 添加文本
  addText: (text?: string, position?: Partial<TextItem['position']>, style?: Partial<TextItem['style']>) => string;
  // 更新文本内容
  updateText: (id: string, text: string) => void;
  // 更新文本位置
  updateTextPosition: (id: string, position: Partial<TextItem['position']>) => void;
  // 更新文本样式
  updateTextStyle: (id: string, style: Partial<TextItem['style']>) => void;
  // 删除文本
  removeText: (id: string) => void;
  // 选择文本
  selectText: (id: string | null) => void;
  // 开始编辑文本
  startEditingText: (id: string) => void;
  // 结束编辑文本
  finishEditingText: () => void;
}

export const useTextStore = create<TextState>((set, get) => ({
  textItems: [],
  selectedTextId: null,
  editingTextId: null,
  
  // 添加新文本
  addText: (text = '点击编辑文本', position = {}, style = {}) => {
    const id = nanoid();
    const defaultPosition = {
      x: 100,
      y: 300,
      scale: 1,
      rotation: 0
    };
    
    const defaultStyle = {
      color: '#000000',
      fontSize: 24,
      fontFamily: 'System',
      fontWeight: 'normal',
      textAlign: 'center' as const
    };
    
    set(state => ({
      textItems: [
        ...state.textItems,
        {
          id,
          text,
          position: { ...defaultPosition, ...position },
          style: { ...defaultStyle, ...style }
        }
      ],
      selectedTextId: id,
      editingTextId: id // 新添加的文本默认处于编辑状态
    }));
    
    return id;
  },
  
  // 更新文本内容
  updateText: (id, text) => {
    set(state => ({
      textItems: state.textItems.map(item => 
        item.id === id ? { ...item, text } : item
      )
    }));
  },
  
  // 更新文本位置
  updateTextPosition: (id, position) => {
    set(state => ({
      textItems: state.textItems.map(item => 
        item.id === id 
          ? { ...item, position: { ...item.position, ...position } }
          : item
      )
    }));
  },
  
  // 更新文本样式
  updateTextStyle: (id, style) => {
    set(state => ({
      textItems: state.textItems.map(item => 
        item.id === id 
          ? { ...item, style: { ...item.style, ...style } }
          : item
      )
    }));
  },
  
  // 删除文本
  removeText: (id) => {
    set(state => ({
      textItems: state.textItems.filter(item => item.id !== id),
      selectedTextId: state.selectedTextId === id ? null : state.selectedTextId,
      editingTextId: state.editingTextId === id ? null : state.editingTextId
    }));
  },
  
  // 选择文本
  selectText: (id) => {
    set({ selectedTextId: id });
  },
  
  // 开始编辑文本
  startEditingText: (id) => {
    set({ editingTextId: id });
  },
  
  // 结束编辑文本
  finishEditingText: () => {
    set({ editingTextId: null });
  }
})); 