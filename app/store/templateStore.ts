import { create } from "zustand";

// 模板类型
export type TemplateType = "t1" | "t2" | "t3" | "t4";

// 模板状态接口
interface TemplateState {
  // 当前选中的模板ID
  currentTemplate: TemplateType | null;

  // 应用模板的方法
  applyTemplate: (templateId: TemplateType) => void;

  // 清除模板的方法
  clearTemplate: () => void;
}

// 创建模板状态管理
export const useTemplateStore = create<TemplateState>((set) => ({
  // 初始状态
  currentTemplate: null,

  // 应用模板
  applyTemplate: (templateId) => {
    console.log(`应用模板: ${templateId}`);
    set({ currentTemplate: templateId });

    // 这里可以添加实际应用模板的逻辑
    // 例如：更新画布布局、应用特定滤镜、设置文本样式等
  },

  // 清除模板
  clearTemplate: () => {
    set({ currentTemplate: null });
  },
}));
