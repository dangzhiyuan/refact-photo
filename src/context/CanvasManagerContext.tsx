import React, { createContext, useContext, ReactNode } from "react";

// Canvas管理器上下文类型
type CanvasManagerContextType = {
  registerCanvas: (id: string, config: any) => void;
  updateCanvas: (id: string, updates: any) => void;
  mergeCanvas: (sourceId: string, targetId: string) => void;
  exportComposite: () => Promise<string>;
  // 其他Canvas管理器方法
};

// 创建上下文
const CanvasManagerContext = createContext<CanvasManagerContextType | undefined>(undefined);

// Provider组件
export const CanvasManagerProvider = ({ children }: { children: ReactNode }) => {
  // Canvas注册表
  const canvasRegistry = React.useRef<Record<string, any>>({});
  
  // 注册Canvas
  const registerCanvas = (id: string, config: any) => {
    canvasRegistry.current[id] = config;
  };
  
  // 更新Canvas状态
  const updateCanvas = (id: string, updates: any) => {
    if (canvasRegistry.current[id]) {
      canvasRegistry.current[id] = { ...canvasRegistry.current[id], ...updates };
    }
  };
  
  // 合并Canvas
  const mergeCanvas = (sourceId: string, targetId: string) => {
    // 实现Canvas合并逻辑
    console.log(`Merging ${sourceId} into ${targetId}`);
  };
  
  // 导出合成结果
  const exportComposite = async (): Promise<string> => {
    // 实现导出逻辑
    return "exported_image_path";
  };
  
  const value = {
    registerCanvas,
    updateCanvas,
    mergeCanvas,
    exportComposite,
  };
  
  return (
    <CanvasManagerContext.Provider value={value}>
      {children}
    </CanvasManagerContext.Provider>
  );
};

// 使用钩子
export const useCanvasManager = () => {
  const context = useContext(CanvasManagerContext);
  if (context === undefined) {
    throw new Error("useCanvasManager must be used within a CanvasManagerProvider");
  }
  return context;
}; 