import { ReactNode } from "react";

/**
 * 面板组件通用属性接口
 */
export interface PanelProps {
  /**
   * 关闭面板的回调函数
   */
  onClose: () => void;

  /**
   * 可选的子组件
   */
  children?: ReactNode;
}
