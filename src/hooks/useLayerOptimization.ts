import { useRef, useEffect, useMemo } from 'react';
import { CanvasLayerRenderer } from '../utils/renderOptimization';
import { useCanvasStore } from '../store/canvasStore';

/**
 * 图层渲染优化Hook
 * 提供智能的图层渲染优化，跟踪哪些图层需要重新渲染
 * 
 * @param visibleLayerIds 当前可见的图层ID数组
 * @returns 优化后的图层处理对象
 */
export function useLayerOptimization(visibleLayerIds: string[] = []) {
  // 创建并保持图层渲染器实例
  const rendererRef = useRef<CanvasLayerRenderer>(new CanvasLayerRenderer());
  const { layers } = useCanvasStore();
  
  // 跟踪上次渲染的图层，用于检测变化
  const lastRenderedLayersRef = useRef<Record<string, number>>({});
  
  // 在组件挂载时注册所有图层，在卸载时清理
  useEffect(() => {
    const renderer = rendererRef.current;
    
    // 注册所有可见图层用于渲染优化
    visibleLayerIds.forEach(layerId => {
      const layer = layers[layerId];
      if (layer) {
        // 根据图层类型和zIndex设置优先级
        const priority = layer.zIndex || 0;
        renderer.registerLayer(layerId, priority);
      }
    });
    
    // 清理函数
    return () => {
      visibleLayerIds.forEach(layerId => {
        renderer.unregisterLayer(layerId);
      });
    };
  }, [visibleLayerIds, layers]);
  
  // 当图层内容变化时，标记需要更新
  useEffect(() => {
    const renderer = rendererRef.current;
    const currentLayers: Record<string, number> = {};
    
    // 检查每个图层是否有变化
    visibleLayerIds.forEach(layerId => {
      const layer = layers[layerId];
      if (layer) {
        // 创建一个图层的"指纹"，用于检测变化
        // 这里使用JSON.stringify的哈希值作为简单实现
        // 在实际产品中，可以使用更高效的方法
        const layerHash = hashObject(layer);
        currentLayers[layerId] = layerHash;
        
        // 如果图层变化了，标记需要更新
        if (lastRenderedLayersRef.current[layerId] !== layerHash) {
          renderer.invalidateLayer(layerId);
        }
      }
    });
    
    // 更新上次渲染的图层引用
    lastRenderedLayersRef.current = currentLayers;
  }, [layers, visibleLayerIds]);
  
  // 创建并返回优化后的图层操作对象
  return useMemo(() => {
    const renderer = rendererRef.current;
    
    return {
      // 检查图层是否需要更新
      needsUpdate: (layerId: string): boolean => {
        return renderer.hasLayersToRender();
      },
      
      // 获取下一个需要渲染的图层ID
      getNextLayerToRender: (): string | null => {
        return renderer.getNextLayerToRender();
      },
      
      // 标记图层已经渲染
      markRendered: (layerId: string): void => {
        renderer.markLayerRendered(layerId);
      },
      
      // 开始渲染循环
      scheduleRendering: (renderFn: (layerId: string) => void) => {
        renderer.scheduleRenderCycle(renderFn);
      },
      
      // 标记图层需要更新
      invalidateLayer: (layerId: string) => {
        renderer.invalidateLayer(layerId);
      },
      
      // 当前所有注册的图层ID
      get registeredLayerIds(): string[] {
        const layerIds: string[] = [];
        // 获取所有已注册的图层ID
        visibleLayerIds.forEach(id => {
          if (layers[id]) {
            layerIds.push(id);
          }
        });
        return layerIds;
      }
    };
  }, [layers, visibleLayerIds]);
}

/**
 * 简单的对象哈希函数，用于生成对象的指纹
 * 注意：这个实现很简单，在生产环境中可能需要一个更高效和健壮的实现
 */
function hashObject(obj: any): number {
  const str = JSON.stringify(obj);
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  return hash;
} 