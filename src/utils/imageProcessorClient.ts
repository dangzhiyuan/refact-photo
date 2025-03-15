/**
 * 图像处理Worker客户端
 * 提供便捷的API来使用图像处理Worker，处理异步操作和消息传递
 */

// 图像处理操作类型
export type ImageOperation = 
  | { type: 'resize'; width: number; height: number }
  | { type: 'filter'; filter: string; intensity?: number }
  | { type: 'adjustment'; adjustments: Record<string, number> }
  | { type: 'crop'; x: number; y: number; width: number; height: number }
  | { type: 'rotate'; angle: number }
  | { type: 'blur'; radius: number }
  | { type: 'sharpen'; amount: number };

// 处理结果接口
export interface ProcessingResult {
  imageData: string;
  processingTime?: number;
}

// 挂起的请求记录
interface PendingRequest {
  resolve: (result: ProcessingResult) => void;
  reject: (error: Error) => void;
}

/**
 * 图像处理客户端类
 * 管理与Worker的通信和处理请求
 */
export class ImageProcessorClient {
  private worker: Worker;
  private isReady: boolean = false;
  private readyPromise: Promise<void>;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private static instance: ImageProcessorClient;
  
  /**
   * 获取图像处理客户端单例
   */
  public static getInstance(): ImageProcessorClient {
    if (!ImageProcessorClient.instance) {
      ImageProcessorClient.instance = new ImageProcessorClient();
    }
    return ImageProcessorClient.instance;
  }
  
  /**
   * 私有构造函数，创建Worker并设置消息处理
   */
  private constructor() {
    // 创建Worker实例
    // 注意：在实际项目中，需要根据打包工具配置调整Worker的创建方式
    // 由于Worker的创建方式依赖于项目的打包配置，这里提供一个简化版本
    try {
      // @ts-ignore - 实际项目中根据打包工具配置调整
      this.worker = new Worker('../workers/imageProcessor.worker.ts');
    } catch (error) {
      console.error('创建图像处理Worker失败:', error);
      throw new Error('无法创建图像处理Worker');
    }
    
    // 设置Ready Promise
    this.readyPromise = new Promise<void>((resolve) => {
      const readyHandler = (event: MessageEvent) => {
        if (event.data && event.data.status === 'ready') {
          this.isReady = true;
          this.worker.removeEventListener('message', readyHandler);
          resolve();
        }
      };
      
      this.worker.addEventListener('message', readyHandler);
    });
    
    // 处理来自Worker的消息
    this.worker.addEventListener('message', this.handleWorkerMessage);
  }
  
  /**
   * 处理Worker的响应消息
   */
  private handleWorkerMessage = (event: MessageEvent): void => {
    const { operationId, status, imageData, error, processingTime } = event.data;
    
    // 查找对应的请求处理器
    const request = this.pendingRequests.get(operationId);
    if (!request) return;
    
    // 从待处理队列中移除
    this.pendingRequests.delete(operationId);
    
    // 根据状态解析或拒绝Promise
    if (status === 'success' && imageData) {
      request.resolve({ imageData, processingTime });
    } else if (status === 'error') {
      request.reject(new Error(error || '未知错误'));
    }
  };
  
  /**
   * 等待Worker准备就绪
   */
  public async waitForReady(): Promise<void> {
    if (this.isReady) return Promise.resolve();
    return this.readyPromise;
  }
  
  /**
   * 处理图像
   * @param imageData 输入图像数据（base64字符串）
   * @param operation 图像处理操作
   * @returns 处理后的图像数据
   */
  public async processImage(
    imageData: string, 
    operation: ImageOperation
  ): Promise<ProcessingResult> {
    // 等待Worker准备就绪
    await this.waitForReady();
    
    // 创建唯一的操作ID
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 创建Promise以异步返回结果
    const resultPromise = new Promise<ProcessingResult>((resolve, reject) => {
      this.pendingRequests.set(operationId, { resolve, reject });
      
      // 设置超时处理
      setTimeout(() => {
        if (this.pendingRequests.has(operationId)) {
          this.pendingRequests.delete(operationId);
          reject(new Error('图像处理操作超时'));
        }
      }, 30000); // 30秒超时
    });
    
    // 发送消息到Worker
    this.worker.postMessage({
      operationId,
      imageData,
      operation
    });
    
    // 返回Promise
    return resultPromise;
  }
  
  /**
   * 应用图像尺寸调整
   */
  public async resizeImage(
    imageData: string,
    width: number,
    height: number
  ): Promise<ProcessingResult> {
    return this.processImage(imageData, { type: 'resize', width, height });
  }
  
  /**
   * 应用滤镜
   */
  public async applyFilter(
    imageData: string,
    filter: string,
    intensity: number = 1
  ): Promise<ProcessingResult> {
    return this.processImage(imageData, { type: 'filter', filter, intensity });
  }
  
  /**
   * 应用图像调整
   */
  public async applyAdjustments(
    imageData: string,
    adjustments: Record<string, number>
  ): Promise<ProcessingResult> {
    return this.processImage(imageData, { type: 'adjustment', adjustments });
  }
  
  /**
   * 裁剪图像
   */
  public async cropImage(
    imageData: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<ProcessingResult> {
    return this.processImage(imageData, { type: 'crop', x, y, width, height });
  }
  
  /**
   * 旋转图像
   */
  public async rotateImage(
    imageData: string,
    angle: number
  ): Promise<ProcessingResult> {
    return this.processImage(imageData, { type: 'rotate', angle });
  }
  
  /**
   * 模糊图像
   */
  public async blurImage(
    imageData: string,
    radius: number
  ): Promise<ProcessingResult> {
    return this.processImage(imageData, { type: 'blur', radius });
  }
  
  /**
   * 锐化图像
   */
  public async sharpenImage(
    imageData: string,
    amount: number
  ): Promise<ProcessingResult> {
    return this.processImage(imageData, { type: 'sharpen', amount });
  }
  
  /**
   * 终止图像处理
   * 在不再需要Worker时调用
   */
  public terminate(): void {
    // 拒绝所有挂起的请求
    this.pendingRequests.forEach(request => {
      request.reject(new Error('图像处理器已终止'));
    });
    
    // 清空请求队列
    this.pendingRequests.clear();
    
    // 终止Worker
    this.worker.terminate();
    
    // 重置状态
    this.isReady = false;
    
    // 删除单例引用
    ImageProcessorClient.instance = undefined as any;
  }
} 