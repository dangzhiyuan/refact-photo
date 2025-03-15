import { Dimensions } from 'react-native';
import { LayerType, DrawingPath, DrawingLayer, StickerLayer } from '../types/canvas';
import { useCanvasStore } from '../../store/canvasStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * 计算绘画路径的边界框
 * 精确计算实际绘制内容的边界，没有多余空间
 */
export const calculatePathsBoundingBox = (paths: DrawingPath[]) => {
  // 初始化边界值为极值
  let minX = Number.MAX_SAFE_INTEGER;
  let minY = Number.MAX_SAFE_INTEGER;
  let maxX = Number.MIN_SAFE_INTEGER;
  let maxY = Number.MIN_SAFE_INTEGER;
  
  // 处理路径点为空的情况
  if (paths.length === 0 || paths.every(path => path.points.length === 0)) {
    return { x: 0, y: 0, width: 100, height: 100 }; // 提供一个默认大小
  }
  
  // 遍历所有路径和点找出精确边界
  paths.forEach(path => {
    // 考虑笔触宽度影响边界，使计算更精确
    const strokeWidth = path.strokeWidth || 1;
    const halfStroke = strokeWidth / 2;
    
    path.points.forEach(point => {
      // 考虑笔触宽度对边界的影响，确保完整包含笔触
      minX = Math.min(minX, point.x - halfStroke);
      minY = Math.min(minY, point.y - halfStroke);
      maxX = Math.max(maxX, point.x + halfStroke);
      maxY = Math.max(maxY, point.y + halfStroke);
    });
  });
  
  // 添加最小必要内边距，仅确保所有线条边缘完全可见
  // 由于已经考虑了笔触宽度，这里的内边距可以很小
  const padding = 2;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;
  
  // 计算精确的宽度和高度
  const width = maxX - minX;
  const height = maxY - minY;
  
  // 返回精确边界，只应用最小的限制
  return { 
    x: minX, 
    y: minY, 
    width: Math.max(width, 10), // 使用非常小的最小宽度
    height: Math.max(height, 10) // 使用非常小的最小高度
  };
};

// SVG路径生成函数
export const generateSvgPath = (points: { x: number; y: number }[]): string => {
  if (points.length < 2) return "";

  const start = points[0];
  let path = `M ${start.x} ${start.y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const xc = (p1.x + p2.x) / 2;
    const yc = (p1.y + p2.y) / 2;
    path += ` Q ${p1.x} ${p1.y}, ${xc} ${yc}`;
  }

  const last = points[points.length - 1];
  path += ` L ${last.x} ${last.y}`;

  return path;
};

/**
 * 创建绘画图层的SVG表示
 * 用于快照转换为贴纸
 */
export const createDrawingSvg = (paths: DrawingPath[], bounds: ReturnType<typeof calculatePathsBoundingBox>) => {
  // 创建SVG头部，精确设置尺寸
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}" viewBox="0 0 ${bounds.width} ${bounds.height}">`;
  
  // 添加SVG背景，但完全透明
  svg += `<rect x="0" y="0" width="${bounds.width}" height="${bounds.height}" fill="transparent" />`;
  
  // 调整所有路径到边界框
  paths.forEach(path => {
    // 调整点坐标，使其相对于边界框
    const adjustedPoints = path.points.map(point => ({
      x: point.x - bounds.x,
      y: point.y - bounds.y
    }));
    
    // 创建SVG路径
    const svgPath = generateSvgPath(adjustedPoints);
    if (svgPath) {
      svg += `<path d="${svgPath}" stroke="${path.color}" stroke-width="${path.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${path.opacity}" />`;
    }
  });
  
  // 关闭SVG
  svg += '</svg>';
  
  return svg;
};

/**
 * 将SVG转换为Data URL
 */
export const svgToDataUrl = (svg: string): string => {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * 将绘画图层转换为贴纸图层
 * @param drawingLayerId 绘画图层ID
 * @param keepOriginal 是否保留原始绘画图层
 * @returns 新创建的贴纸图层ID，如果转换失败则返回null
 */
export const convertDrawingToSticker = (
  drawingLayerId: string,
  keepOriginal: boolean = false
): string | null => {
  try {
    // 获取Canvas存储
    const canvasStore = useCanvasStore.getState();
    const { layers, addLayer, deleteLayer } = canvasStore;
    
    // 获取绘画图层
    const drawingLayer = layers[drawingLayerId];
    if (!drawingLayer || drawingLayer.type !== LayerType.DRAWING) {
      console.error("无效的绘画图层ID:", drawingLayerId);
      return null;
    }
    
    // 计算精确的边界框
    const bounds = calculatePathsBoundingBox(drawingLayer.paths);
    console.log("绘画边界精确计算结果:", bounds);
    
    // 如果边界无效或太小，使用默认值
    if (bounds.width <= 10 || bounds.height <= 10) {
      bounds.width = Math.max(bounds.width, 100);
      bounds.height = Math.max(bounds.height, 100);
    }
    
    // 创建SVG，精确地只包含边界内的内容
    const svg = createDrawingSvg(drawingLayer.paths, bounds);
    const dataUri = svgToDataUrl(svg);
    
    // 创建一个新的贴纸图层
    const newStickerId = `sticker_${Date.now()}`;
    
    // 获取现有图层中最大的zIndex，确保新贴纸在最上层
    let maxZIndex = 0;
    Object.values(layers).forEach(layer => {
      if (layer.zIndex > maxZIndex) {
        maxZIndex = layer.zIndex;
      }
    });
    
    // 保存原始图层的变换信息
    const originalTransform = drawingLayer.transform || { position: { x: 0, y: 0 }, scale: 1, rotation: 0 };
    
    // 创建贴纸图层，使用精确计算的边界和位置
    const stickerLayer: StickerLayer = {
      id: newStickerId,
      type: LayerType.STICKER,
      stickerUri: dataUri,
      width: bounds.width,
      height: bounds.height,
      visible: true,
      opacity: 1,
      zIndex: maxZIndex + 1,
      transform: {
        // 位置需要考虑边界和原始图层的位置
        position: { 
          x: bounds.x + (originalTransform.position?.x || 0),
          y: bounds.y + (originalTransform.position?.y || 0)
        },
        scale: originalTransform.scale || 1,
        rotation: originalTransform.rotation || 0
      }
    };
    
    // 添加贴纸图层
    addLayer(stickerLayer);
    console.log("绘画成功转换为贴纸:", 
      newStickerId, 
      "边界:", bounds, 
      "原始变换:", originalTransform,
      "贴纸变换:", stickerLayer.transform
    );
    
    // 如果不保留原始图层，则删除它
    if (!keepOriginal) {
      deleteLayer(drawingLayerId);
      console.log("删除原始绘画图层:", drawingLayerId);
    }
    
    return newStickerId;
  } catch (error) {
    console.error("绘画转换为贴纸失败:", error);
    return null;
  }
}; 