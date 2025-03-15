/**
 * 渲染优化工具函数
 * 提供防抖、节流和分层渲染相关的优化函数
 */

/**
 * 防抖函数，用于减少高频事件的处理次数
 * 适用于窗口大小调整、文本输入等
 * 
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @param immediate 是否在延迟开始前调用
 * @returns 防抖处理后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait = 300,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(context, args);
  };
}

/**
 * 节流函数，用于限制函数调用频率
 * 适用于滚动、拖拽、动画等
 * 
 * @param func 要节流的函数
 * @param limit 时间限制（毫秒）
 * @returns 节流处理后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit = 100
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

/**
 * 画布分层渲染器
 * 用于分析和优化画布渲染性能
 */
export class CanvasLayerRenderer {
  private layers: Map<string, {
    needsUpdate: boolean;
    lastRenderTime: number;
    priority: number;
  }> = new Map();
  
  /**
   * 注册一个新图层进行渲染追踪
   */
  registerLayer(layerId: string, priority: number = 0) {
    this.layers.set(layerId, {
      needsUpdate: true,
      lastRenderTime: 0,
      priority
    });
  }
  
  /**
   * 从渲染追踪中移除图层
   */
  unregisterLayer(layerId: string) {
    this.layers.delete(layerId);
  }
  
  /**
   * 标记图层需要更新
   */
  invalidateLayer(layerId: string) {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.needsUpdate = true;
      this.layers.set(layerId, layer);
    }
  }
  
  /**
   * 获取下一个需要渲染的图层
   * 基于优先级和自上次渲染以来的时间
   */
  getNextLayerToRender(): string | null {
    let nextLayer: string | null = null;
    let highestScore = -1;
    const now = Date.now();
    
    this.layers.forEach((layerInfo, layerId) => {
      if (layerInfo.needsUpdate) {
        // 计算渲染得分 = 优先级 * (上次渲染以来的时间)
        const timeSinceLastRender = now - layerInfo.lastRenderTime;
        const score = layerInfo.priority * timeSinceLastRender;
        
        if (score > highestScore) {
          highestScore = score;
          nextLayer = layerId;
        }
      }
    });
    
    return nextLayer;
  }
  
  /**
   * 标记图层已完成渲染
   */
  markLayerRendered(layerId: string) {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.needsUpdate = false;
      layer.lastRenderTime = Date.now();
      this.layers.set(layerId, layer);
    }
  }
  
  /**
   * 安排图层渲染
   * 将在空闲时间渲染需要更新的图层
   */
  scheduleRenderCycle(renderCallback: (layerId: string) => Promise<void> | void) {
    // 使用requestIdleCallback或setTimeout优化渲染循环
    const executeRenderCycle = () => {
      const layerId = this.getNextLayerToRender();
      if (layerId) {
        // 标记为已渲染，防止重复处理
        this.markLayerRendered(layerId);
        
        // 执行渲染
        const result = renderCallback(layerId);
        
        // 如果返回Promise，等待完成后继续处理下一个
        if (result instanceof Promise) {
          result.then(() => {
            // 安排下一轮渲染周期
            setTimeout(executeRenderCycle, 0);
          });
        } else {
          // 安排下一轮渲染周期
          setTimeout(executeRenderCycle, 0);
        }
      }
    };
    
    // 启动渲染循环
    executeRenderCycle();
  }

  /**
   * 检查当前是否有图层需要渲染
   */
  hasLayersToRender(): boolean {
    for (const [_, layerInfo] of this.layers) {
      if (layerInfo.needsUpdate) {
        return true;
      }
    }
    return false;
  }
}

/**
 * RAF (RequestAnimationFrame) 节流包装器
 * 确保回调仅在下一个动画帧执行
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  callback: T
): (...args: Parameters<T>) => void {
  let requestId: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  
  const throttled = function(this: any, ...args: Parameters<T>) {
    lastArgs = args;
    
    if (requestId === null) {
      requestId = requestAnimationFrame(() => {
        if (lastArgs) {
          callback.apply(this, lastArgs);
        }
        requestId = null;
      });
    }
  };
  
  throttled.cancel = () => {
    if (requestId !== null) {
      cancelAnimationFrame(requestId);
      requestId = null;
    }
  };
  
  return throttled;
}

/**
 * Reanimated 安全版本的 RAF 节流包装器
 * 专门设计用于在 Reanimated 工作流中安全使用
 * 避免在 worklet 上下文中修改引用的 .current 属性导致的崩溃
 * 
 * @param callback 要节流的回调函数
 * @returns 节流处理后的安全函数
 */
export function reanimatedSafeRafThrottle<T extends (...args: any[]) => any>(
  callback: T
): (...args: Parameters<T>) => void {
  // 使用闭包变量而不是引用对象
  let requestId: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  let isThrottled = false;
  
  const safeThrottled = function(this: any, ...args: Parameters<T>) {
    // 存储最新的参数
    lastArgs = args;
    
    // 如果当前未被节流，安排下一帧执行
    if (!isThrottled) {
      isThrottled = true;
      
      // 使用 requestAnimationFrame 而不是存储其 ID
      requestAnimationFrame(() => {
        // 执行回调
        if (lastArgs) {
          callback.apply(this, lastArgs);
        }
        
        // 重置节流状态，允许下一次调用
        isThrottled = false;
        lastArgs = null;
      });
    }
  };
  
  return safeThrottled;
}

/**
 * 分割大量计算工作为较小的块，并在帧之间执行
 * 用于防止长时间计算阻塞UI线程
 * 
 * @param items 需要处理的项目列表
 * @param processItemFn 处理单个项目的函数
 * @param chunkSize 每块中处理的项目数
 * @returns Promise，在所有项目处理完成后解析
 */
export function processInChunks<T, R>(
  items: T[],
  processItemFn: (item: T) => R,
  chunkSize = 10
): Promise<R[]> {
  return new Promise(resolve => {
    const results: R[] = [];
    let index = 0;
    
    function processNextChunk() {
      const start = index;
      const end = Math.min(start + chunkSize, items.length);
      
      for (let i = start; i < end; i++) {
        results.push(processItemFn(items[i]));
      }
      
      index = end;
      
      if (index < items.length) {
        // 安排下一个块的处理，让UI有时间响应
        setTimeout(processNextChunk, 0);
      } else {
        // 所有块处理完成
        resolve(results);
      }
    }
    
    processNextChunk();
  });
} 