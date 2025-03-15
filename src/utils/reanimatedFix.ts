/**
 * Reanimated 修复工具
 * 
 * 提供帮助解决 React Native Reanimated 常见问题的工具函数
 */

import { useCallback } from 'react';
import { useSharedValue } from 'react-native-reanimated';

/**
 * 创建一个安全的防抖函数，适用于在 Reanimated 工作流中
 * 避免 "tried to modify key of an object which has been converted to a shareable" 错误
 * 
 * @param callback 需要防抖的回调函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖处理过的函数
 */
export function createSafeDebounce<T extends (...args: any[]) => any>(
  callback: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  // 使用闭包而不是对象引用
  let timeout: number | null = null;
  
  return function(...args: Parameters<T>) {
    // 清除之前的定时器
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    // 设置新的定时器
    timeout = setTimeout(() => {
      callback(...args);
      timeout = null;
    }, wait) as unknown as number;
  };
}

/**
 * 创建一个安全的 requestAnimationFrame 防抖函数
 * 避免在 Reanimated worklet 中对共享对象的修改问题
 * 
 * @param callback 需要节流的回调函数
 * @returns 节流处理过的函数
 */
export function createSafeRafThrottle<T extends (...args: any[]) => any>(
  callback: T
): (...args: Parameters<T>) => void {
  let isScheduled = false;
  let lastArgs: Parameters<T> | null = null;
  
  return function(...args: Parameters<T>) {
    // 保存最新的参数
    lastArgs = args;
    
    // 如果没有安排执行，则安排一个
    if (!isScheduled) {
      isScheduled = true;
      
      requestAnimationFrame(() => {
        if (lastArgs !== null) {
          callback(...lastArgs);
        }
        isScheduled = false;
      });
    }
  };
}

/**
 * 使用安全的共享值跟踪可能在 worklet 中访问的 React 状态
 * 避免在 worklet 中读取引用值导致的问题
 * 
 * @param initialValue 初始值
 * @returns 一个包含共享值和更新此值的函数的对象
 */
export function useSafeSharedState<T>(initialValue: T) {
  // 创建共享值
  const sharedValue = useSharedValue<T>(initialValue);
  
  // 提供一个更新函数
  const setValue = useCallback((newValue: T) => {
    sharedValue.value = newValue;
  }, [sharedValue]);
  
  return {
    value: sharedValue,
    setValue
  };
}

/**
 * 修复 Reanimated 事件传递给 JS 线程的工具
 * 确保只有需要的数据被传递，避免共享引用问题
 * 
 * @param event 原始事件对象
 * @returns 包含所需数据的安全对象
 */
export function sanitizeEventForJS(event: any): any {
  'worklet';
  
  console.log('[ReanimatedFix:worklet] sanitizeEventForJS called');
  
  try {
    // 创建一个新对象，只包含必要的数据
    const sanitized: any = {};
    
    // 复制简单数据类型
    if (event.x !== undefined) sanitized.x = event.x;
    if (event.y !== undefined) sanitized.y = event.y;
    if (event.absoluteX !== undefined) sanitized.absoluteX = event.absoluteX;
    if (event.absoluteY !== undefined) sanitized.absoluteY = event.absoluteY;
    if (event.translationX !== undefined) sanitized.translationX = event.translationX;
    if (event.translationY !== undefined) sanitized.translationY = event.translationY;
    if (event.velocityX !== undefined) sanitized.velocityX = event.velocityX;
    if (event.velocityY !== undefined) sanitized.velocityY = event.velocityY;
    if (event.scale !== undefined) sanitized.scale = event.scale;
    if (event.rotation !== undefined) sanitized.rotation = event.rotation;
    if (event.state !== undefined) sanitized.state = event.state;
    
    console.log('[ReanimatedFix:worklet] Event sanitized successfully');
    return sanitized;
  } catch (error) {
    console.error('[ReanimatedFix:worklet] Error sanitizing event:', error);
    // 回退方案：只返回基本坐标
    return { x: event.x || 0, y: event.y || 0 };
  }
}

/**
 * 安全地包装 JS 线程函数，防止异常导致应用崩溃
 * 用于 runOnJS 调用的函数
 * 
 * @param fn 要包装的函数
 * @returns 包装后的安全函数
 */
export function safeJSFunction<T extends (...args: any[]) => any>(
  fn: T,
  debugName: string = 'unknown'
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    try {
      console.log(`[ReanimatedFix] Calling safe JS function: ${debugName}`);
      return fn(...args);
    } catch (error) {
      console.error(`[ReanimatedFix] Error in JS function ${debugName}:`, error);
      return undefined;
    }
  };
}

/**
 * 用于创建安全的事件处理函数的工具函数
 * 将完整的事件处理过程包装在错误处理中
 * 
 * @param fn 事件处理函数
 * @param debugName 调试名称
 * @returns 安全的事件处理函数
 */
export function createSafeEventHandler<T extends (...args: any[]) => any>(
  fn: T,
  debugName: string = 'eventHandler'
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    try {
      console.log(`[ReanimatedFix] Running safe event handler: ${debugName}`);
      return fn(...args);
    } catch (error) {
      console.error(`[ReanimatedFix] Error in event handler ${debugName}:`, error);
      // 创建一个与原始函数返回类型匹配的返回值
      return undefined as unknown as ReturnType<T>;
    }
  }) as T;
} 