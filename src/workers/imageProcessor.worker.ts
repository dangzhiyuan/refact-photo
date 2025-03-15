/**
 * 图像处理Web Worker
 * 
 * 这个worker用于在后台线程执行图像处理操作，
 * 避免在主UI线程执行复杂计算导致的卡顿
 */

// 确保TypeScript了解这是一个独立的执行环境
const ctx: Worker = self as any;

// 图像处理操作结果
interface ProcessingResult {
  // 操作的唯一ID
  operationId: string;
  
  // 处理后的图像数据 (base64)
  imageData?: string;
  
  // 处理状态
  status: 'success' | 'error';
  
  // 错误信息 (如果有)
  error?: string;
  
  // 处理耗时 (毫秒)
  processingTime?: number;
}

// 支持的图像处理操作
type ImageOperation = 
  | { type: 'resize'; width: number; height: number }
  | { type: 'filter'; filter: string; intensity?: number }
  | { type: 'adjustment'; adjustments: Record<string, number> }
  | { type: 'crop'; x: number; y: number; width: number; height: number }
  | { type: 'rotate'; angle: number }
  | { type: 'blur'; radius: number }
  | { type: 'sharpen'; amount: number };

// 图像处理请求消息
interface ProcessingRequest {
  // 操作的唯一ID
  operationId: string;
  
  // 输入图像 (base64)
  imageData: string;
  
  // 要执行的操作
  operation: ImageOperation;
}

// 使用临时canvas进行图像处理
let offscreenCanvas: OffscreenCanvas | null = null;
let ctx2d: OffscreenCanvasRenderingContext2D | null = null;

// 处理来自主线程的消息
ctx.addEventListener('message', (event: MessageEvent<ProcessingRequest>) => {
  const { operationId, imageData, operation } = event.data;
  const startTime = performance.now();
  
  try {
    // 创建图像对象
    const image = new Image();
    image.src = imageData;
    
    // 执行请求的操作
    const result = processImage(image, operation);
    
    // 计算处理耗时
    const processingTime = performance.now() - startTime;
    
    // 将结果发送回主线程
    ctx.postMessage({
      operationId,
      imageData: result,
      status: 'success',
      processingTime
    } as ProcessingResult);
  } catch (error) {
    // 发送错误信息回主线程
    ctx.postMessage({
      operationId,
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    } as ProcessingResult);
  }
});

/**
 * 处理图像
 * @param image 输入图像
 * @param operation 要执行的操作
 * @returns 处理后的图像数据 (base64)
 */
function processImage(image: HTMLImageElement, operation: ImageOperation): string {
  // 延迟初始化canvas
  if (!offscreenCanvas || !ctx2d) {
    offscreenCanvas = new OffscreenCanvas(1, 1);
    ctx2d = offscreenCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    
    if (!ctx2d) {
      throw new Error('无法创建Canvas 2D上下文');
    }
  }
  
  // 根据操作类型执行不同的处理
  switch (operation.type) {
    case 'resize':
      return resizeImage(image, operation.width, operation.height);
    
    case 'filter':
      return applyFilter(image, operation.filter, operation.intensity);
    
    case 'adjustment':
      return applyAdjustments(image, operation.adjustments);
    
    case 'crop':
      return cropImage(image, operation.x, operation.y, operation.width, operation.height);
    
    case 'rotate':
      return rotateImage(image, operation.angle);
    
    case 'blur':
      return blurImage(image, operation.radius);
    
    case 'sharpen':
      return sharpenImage(image, operation.amount);
    
    default:
      throw new Error('不支持的操作类型');
  }
}

/**
 * 调整图像大小
 */
function resizeImage(image: HTMLImageElement, width: number, height: number): string {
  if (!offscreenCanvas || !ctx2d) {
    throw new Error('Canvas未初始化');
  }
  
  // 设置canvas尺寸
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;
  
  // 清除canvas
  ctx2d.clearRect(0, 0, width, height);
  
  // 绘制调整大小后的图像
  ctx2d.drawImage(image, 0, 0, width, height);
  
  // 转换为blob并返回base64
  return offscreenCanvas.convertToBlob()
    .then(blob => blobToBase64(blob))
    .catch(error => {
      throw new Error(`调整大小失败: ${error.message}`);
    });
}

/**
 * 应用滤镜
 */
function applyFilter(image: HTMLImageElement, filter: string, intensity: number = 1): string {
  if (!offscreenCanvas || !ctx2d) {
    throw new Error('Canvas未初始化');
  }
  
  // 设置canvas尺寸
  offscreenCanvas.width = image.width;
  offscreenCanvas.height = image.height;
  
  // 清除canvas
  ctx2d.clearRect(0, 0, image.width, image.height);
  
  // 根据滤镜类型设置不同的CSS滤镜
  let filterCSS = '';
  
  switch (filter) {
    case 'grayscale':
      filterCSS = `grayscale(${intensity * 100}%)`;
      break;
    case 'sepia':
      filterCSS = `sepia(${intensity * 100}%)`;
      break;
    case 'invert':
      filterCSS = `invert(${intensity * 100}%)`;
      break;
    case 'blur':
      filterCSS = `blur(${intensity * 5}px)`;
      break;
    case 'brightness':
      filterCSS = `brightness(${100 + intensity * 50}%)`;
      break;
    case 'contrast':
      filterCSS = `contrast(${100 + intensity * 50}%)`;
      break;
    default:
      filterCSS = '';
  }
  
  // 应用滤镜
  ctx2d.filter = filterCSS;
  
  // 绘制图像
  ctx2d.drawImage(image, 0, 0);
  
  // 重置滤镜
  ctx2d.filter = 'none';
  
  // 转换为blob并返回base64
  return offscreenCanvas.convertToBlob()
    .then(blob => blobToBase64(blob))
    .catch(error => {
      throw new Error(`应用滤镜失败: ${error.message}`);
    });
}

/**
 * 应用调整
 */
function applyAdjustments(image: HTMLImageElement, adjustments: Record<string, number>): string {
  if (!offscreenCanvas || !ctx2d) {
    throw new Error('Canvas未初始化');
  }
  
  // 设置canvas尺寸
  offscreenCanvas.width = image.width;
  offscreenCanvas.height = image.height;
  
  // 清除canvas
  ctx2d.clearRect(0, 0, image.width, image.height);
  
  // 构建CSS滤镜字符串
  let filterString = '';
  
  if (adjustments.brightness !== undefined) {
    const value = 100 + adjustments.brightness;
    filterString += `brightness(${value}%) `;
  }
  
  if (adjustments.contrast !== undefined) {
    const value = 100 + adjustments.contrast;
    filterString += `contrast(${value}%) `;
  }
  
  if (adjustments.saturation !== undefined) {
    const value = 100 + adjustments.saturation;
    filterString += `saturate(${value}%) `;
  }
  
  // 应用滤镜
  ctx2d.filter = filterString.trim();
  
  // 绘制图像
  ctx2d.drawImage(image, 0, 0);
  
  // 重置滤镜
  ctx2d.filter = 'none';
  
  // 转换为blob并返回base64
  return offscreenCanvas.convertToBlob()
    .then(blob => blobToBase64(blob))
    .catch(error => {
      throw new Error(`应用调整失败: ${error.message}`);
    });
}

/**
 * 裁剪图像
 */
function cropImage(
  image: HTMLImageElement, 
  x: number, 
  y: number, 
  width: number, 
  height: number
): string {
  if (!offscreenCanvas || !ctx2d) {
    throw new Error('Canvas未初始化');
  }
  
  // 设置canvas尺寸为裁剪后的尺寸
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;
  
  // 清除canvas
  ctx2d.clearRect(0, 0, width, height);
  
  // 在canvas上绘制图像的指定区域
  ctx2d.drawImage(image, x, y, width, height, 0, 0, width, height);
  
  // 转换为blob并返回base64
  return offscreenCanvas.convertToBlob()
    .then(blob => blobToBase64(blob))
    .catch(error => {
      throw new Error(`裁剪图像失败: ${error.message}`);
    });
}

/**
 * 旋转图像
 */
function rotateImage(image: HTMLImageElement, angle: number): string {
  if (!offscreenCanvas || !ctx2d) {
    throw new Error('Canvas未初始化');
  }
  
  // 计算旋转后的尺寸
  const radians = (angle * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  
  const imgWidth = image.width;
  const imgHeight = image.height;
  
  const newWidth = Math.floor(imgWidth * cos + imgHeight * sin);
  const newHeight = Math.floor(imgWidth * sin + imgHeight * cos);
  
  // 设置canvas尺寸
  offscreenCanvas.width = newWidth;
  offscreenCanvas.height = newHeight;
  
  // 清除canvas
  ctx2d.clearRect(0, 0, newWidth, newHeight);
  
  // 移动到新画布的中心
  ctx2d.translate(newWidth / 2, newHeight / 2);
  
  // 旋转
  ctx2d.rotate(radians);
  
  // 绘制图像，注意偏移量
  ctx2d.drawImage(image, -imgWidth / 2, -imgHeight / 2);
  
  // 重置变换
  ctx2d.setTransform(1, 0, 0, 1, 0, 0);
  
  // 转换为blob并返回base64
  return offscreenCanvas.convertToBlob()
    .then(blob => blobToBase64(blob))
    .catch(error => {
      throw new Error(`旋转图像失败: ${error.message}`);
    });
}

/**
 * 模糊图像
 */
function blurImage(image: HTMLImageElement, radius: number): string {
  if (!offscreenCanvas || !ctx2d) {
    throw new Error('Canvas未初始化');
  }
  
  // 设置canvas尺寸
  offscreenCanvas.width = image.width;
  offscreenCanvas.height = image.height;
  
  // 清除canvas
  ctx2d.clearRect(0, 0, image.width, image.height);
  
  // 应用模糊滤镜
  ctx2d.filter = `blur(${radius}px)`;
  
  // 绘制图像
  ctx2d.drawImage(image, 0, 0);
  
  // 重置滤镜
  ctx2d.filter = 'none';
  
  // 转换为blob并返回base64
  return offscreenCanvas.convertToBlob()
    .then(blob => blobToBase64(blob))
    .catch(error => {
      throw new Error(`模糊图像失败: ${error.message}`);
    });
}

/**
 * 锐化图像
 * 注意：Canvas API没有内置的锐化滤镜，这里使用自定义算法
 */
function sharpenImage(image: HTMLImageElement, amount: number): string {
  if (!offscreenCanvas || !ctx2d) {
    throw new Error('Canvas未初始化');
  }
  
  // 设置canvas尺寸
  offscreenCanvas.width = image.width;
  offscreenCanvas.height = image.height;
  
  // 清除canvas
  ctx2d.clearRect(0, 0, image.width, image.height);
  
  // 先绘制原始图像
  ctx2d.drawImage(image, 0, 0);
  
  // 获取图像数据
  const imageData = ctx2d.getImageData(0, 0, image.width, image.height);
  const data = imageData.data;
  
  // 创建一个副本用于计算
  const original = new Uint8ClampedArray(data);
  
  // 卷积核
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];
  
  // 应用卷积
  const w = image.width;
  const h = image.height;
  
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      
      // 对RGB通道应用卷积
      for (let c = 0; c < 3; c++) {
        let val = 0;
        
        // 应用3x3卷积核
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const kidx = ((y + ky) * w + (x + kx)) * 4 + c;
            const k = kernel[(ky + 1) * 3 + (kx + 1)];
            val += original[kidx] * k;
          }
        }
        
        // 限制值在0-255范围内
        data[idx + c] = Math.min(255, Math.max(0, val));
      }
    }
  }
  
  // 将处理后的图像数据放回canvas
  ctx2d.putImageData(imageData, 0, 0);
  
  // 转换为blob并返回base64
  return offscreenCanvas.convertToBlob()
    .then(blob => blobToBase64(blob))
    .catch(error => {
      throw new Error(`锐化图像失败: ${error.message}`);
    });
}

/**
 * 将Blob转换为base64字符串
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// 通知主线程worker已准备好
ctx.postMessage({ status: 'ready' }); 