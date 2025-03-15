import { Skia, Canvas, SkImage } from "@shopify/react-native-skia";
import { DrawingPath, LayerType, StickerLayer } from "../core/types/canvas";
import { useCanvasStore } from "../store/canvasStore";

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 计算绘画路径的边界框
 */
export const calculatePathsBoundingBox = (paths: DrawingPath[]): BoundingBox => {
  // 初始化边界值
  let minX = Number.MAX_SAFE_INTEGER;
  let minY = Number.MAX_SAFE_INTEGER;
  let maxX = Number.MIN_SAFE_INTEGER;
  let maxY = Number.MIN_SAFE_INTEGER;
  
  // 处理路径点为空的情况
  if (paths.length === 0 || paths.every(path => path.points.length === 0)) {
    return { x: 0, y: 0, width: 100, height: 100 }; // 提供一个默认大小
  }
  
  // 遍历所有路径和点找出边界
  paths.forEach(path => {
    path.points.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
  });
  
  // 添加内边距
  const padding = 20;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;
  
  // 计算宽度和高度
  const width = maxX - minX;
  const height = maxY - minY;
  
  return { 
    x: minX, 
    y: minY, 
    width: Math.max(width, 50), // 确保至少有最小宽度
    height: Math.max(height, 50) // 确保至少有最小高度
  };
};

/**
 * 生成SVG路径字符串
 */
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
 * 将绘画图层转换为贴纸图层
 * @param drawingLayerId 绘画图层ID
 * @param keepOriginal 是否保留原始绘画图层
 * @returns 新创建的贴纸图层ID，如果转换失败则返回null
 */
export const convertDrawingToSticker = async (
  drawingLayerId: string,
  keepOriginal: boolean = false
): Promise<string | null> => {
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
    
    // 计算边界框
    const bounds = calculatePathsBoundingBox(drawingLayer.paths);
    
    // 创建离屏Canvas进行渲染
    const surface = Skia.Surface.Make(bounds.width, bounds.height);
    if (!surface) {
      console.error("无法创建Skia Surface");
      return null;
    }
    
    const canvas = surface.getCanvas();
    
    // 清除画布背景为透明
    canvas.clear(Skia.Color(0, 0, 0, 0));
    
    // 绘制所有路径
    drawingLayer.paths.forEach(path => {
      // 创建路径
      const skPath = Skia.Path.Make();
      
      // 调整点坐标，使其相对于边界框
      const adjustedPoints = path.points.map(point => ({
        x: point.x - bounds.x,
        y: point.y - bounds.y
      }));
      
      if (adjustedPoints.length >= 2) {
        // 移动到起点
        skPath.moveTo(adjustedPoints[0].x, adjustedPoints[0].y);
        
        // 添加路径点
        for (let i = 1; i < adjustedPoints.length - 1; i++) {
          const p1 = adjustedPoints[i];
          const p2 = adjustedPoints[i + 1];
          const xc = (p1.x + p2.x) / 2;
          const yc = (p1.y + p2.y) / 2;
          skPath.quadTo(p1.x, p1.y, xc, yc);
        }
        
        // 添加最后一个点
        const last = adjustedPoints[adjustedPoints.length - 1];
        skPath.lineTo(last.x, last.y);
        
        // 创建画笔
        const paint = Skia.Paint();
        // 使用Skia的颜色处理API
        const color = path.color.startsWith('#') ? 
          path.color : 
          `rgba(0,0,0,${path.opacity})`;
        
        paint.setColor(Skia.Color(color));
        // 设置为描边样式
        paint.setStyle("stroke");
        paint.setStrokeWidth(path.strokeWidth);
        paint.setStrokeCap("round");
        paint.setStrokeJoin("round");
        paint.setAlphaf(path.opacity);
        
        // 绘制路径
        canvas.drawPath(skPath, paint);
      }
    });
    
    // 从surface获取图像
    const image = surface.makeImageSnapshot();
    
    // 将图像编码为base64的PNG
    const base64 = image.encodeToBase64();
    const dataUri = `data:image/png;base64,${base64}`;
    
    // 创建一个新的贴纸图层
    const newStickerId = `sticker_${Date.now()}`;
    
    // 获取现有图层中最大的zIndex
    let maxZIndex = 0;
    Object.values(layers).forEach(layer => {
      if (layer.zIndex > maxZIndex) {
        maxZIndex = layer.zIndex;
      }
    });
    
    // 创建贴纸图层
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
        // 使用绘画图层的位置
        position: { 
          x: bounds.x + (drawingLayer.transform?.position?.x || 0),
          y: bounds.y + (drawingLayer.transform?.position?.y || 0)
        },
        scale: drawingLayer.transform?.scale || 1,
        rotation: drawingLayer.transform?.rotation || 0
      }
    };
    
    // 添加贴纸图层
    addLayer(stickerLayer);
    console.log("绘画转换为贴纸成功:", newStickerId);
    
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