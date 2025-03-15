/**
 * 创建固定数量手势钩子的工厂函数
 * 解决React Hooks不能在循环中调用的限制
 */

import { useEffect, useRef } from "react";

/**
 * 创建一个接受固定数量项目的自定义钩子
 * @param maxCount 最大支持的项目数量
 * @param hookCreator 为每个索引创建钩子的函数
 * @returns 返回一个自定义钩子，该钩子将返回固定大小的数组
 */
export const createFixedSizeGestureHook = <T, P extends any[]>(
  maxCount: number,
  hookCreator: (index: number, item: any, ...args: P) => T
) => {
  return (items: any[], ...args: P): T[] => {
    // 创建一个refs对象，用于跟踪项目ID，帮助检测变化
    const itemIdsRef = useRef<string[]>([]);
    
    // 预创建所有可能的手势状态
    // 注意：这些必须在组件顶层调用，不能在循环或条件语句中
    const gesture0 = hookCreator(0, items[0], ...args);
    const gesture1 = hookCreator(1, items[1], ...args);
    const gesture2 = hookCreator(2, items[2], ...args);
    const gesture3 = hookCreator(3, items[3], ...args);
    const gesture4 = hookCreator(4, items[4], ...args);
    
    // 可以根据需要扩展更多...
    
    // 存储所有钩子结果
    const gestures = [gesture0, gesture1, gesture2, gesture3, gesture4];
    
    // 监听项目变化，用于日志记录或调试
    useEffect(() => {
      const newItemIds = items.map(item => item).filter(Boolean);
      if (JSON.stringify(newItemIds) !== JSON.stringify(itemIdsRef.current)) {
        console.log("绘画图层更新:", newItemIds);
        itemIdsRef.current = newItemIds;
      }
    }, [items]);
    
    // 只返回maxCount限制内的手势
    return gestures.slice(0, Math.min(maxCount, gestures.length));
  };
}; 