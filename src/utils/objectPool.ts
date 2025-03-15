/**
 * 对象池实现
 * 用于减少对象创建和垃圾回收的开销
 */

/**
 * 通用对象池接口
 */
export interface ObjectPool<T> {
  /**
   * 从池中获取一个对象
   */
  acquire(): T;
  
  /**
   * 将对象归还到池中
   */
  release(obj: T): void;
  
  /**
   * 获取池中当前可用对象数量
   */
  getAvailableCount(): number;
  
  /**
   * 清空对象池
   */
  clear(): void;
}

/**
 * 标准对象池的实现
 */
export class SimpleObjectPool<T> implements ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;
  
  /**
   * 创建一个新的对象池
   * 
   * @param factory 创建新对象的工厂函数
   * @param reset 重置对象状态的函数
   * @param initialSize 初始池大小
   * @param maxSize 最大池大小
   */
  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    initialSize = 0,
    maxSize = 100
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
    
    // 预填充池
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }
  
  /**
   * 从池中获取一个对象
   * 如果池为空，则创建一个新对象
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    } else {
      return this.factory();
    }
  }
  
  /**
   * 将对象归还到池中
   * 重置对象状态，然后添加到池中
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
    // 如果池已满，对象将被丢弃并由垃圾回收处理
  }
  
  /**
   * 获取池中当前可用对象数量
   */
  getAvailableCount(): number {
    return this.pool.length;
  }
  
  /**
   * 清空对象池
   */
  clear(): void {
    this.pool.length = 0;
  }
}

/**
 * 点对象的对象池
 * 用于优化路径绘制中的点创建
 */
export class PointPool {
  private static instance: SimpleObjectPool<{x: number, y: number}>;
  private static createdCount: number = 0;
  private static releasedCount: number = 0;
  
  /**
   * 获取点对象池的单例
   */
  static getInstance(): ObjectPool<{x: number, y: number}> {
    if (!PointPool.instance) {
      console.log('[PointPool] Initializing pool');
      PointPool.instance = new SimpleObjectPool<{x: number, y: number}>(
        // 创建新点的工厂函数
        () => {
          PointPool.createdCount++;
          console.log('[PointPool] Creating new point, total created:', PointPool.createdCount);
          return { x: 0, y: 0 };
        },
        // 重置点的函数
        (point) => {
          point.x = 0;
          point.y = 0;
        },
        // 初始池大小
        50,
        // 最大池大小
        500
      );
    }
    return PointPool.instance;
  }
  
  /**
   * 创建一个新点
   */
  static create(x: number, y: number): {x: number, y: number} {
    console.log('[PointPool] Creating point:', x, y);
    try {
      const point = PointPool.getInstance().acquire();
      point.x = x;
      point.y = y;
      console.log('[PointPool] Point created successfully');
      return point;
    } catch (error) {
      console.error('[PointPool] Error creating point:', error);
      // 回退到简单对象创建
      return { x, y };
    }
  }
  
  /**
   * 释放一个点
   */
  static release(point: {x: number, y: number}): void {
    try {
      PointPool.getInstance().release(point);
      PointPool.releasedCount++;
      console.log('[PointPool] Point released, total released:', PointPool.releasedCount);
    } catch (error) {
      console.error('[PointPool] Error releasing point:', error);
    }
  }
  
  /**
   * 释放点数组
   */
  static releaseArray(points: {x: number, y: number}[]): void {
    console.log('[PointPool] Releasing array of points, count:', points.length);
    try {
      const pool = PointPool.getInstance();
      points.forEach(point => pool.release(point));
      PointPool.releasedCount += points.length;
      console.log('[PointPool] Points array released, total released:', PointPool.releasedCount);
    } catch (error) {
      console.error('[PointPool] Error releasing points array:', error);
    }
  }
  
  /**
   * 获取池统计信息
   */
  static getStats(): { created: number; released: number; available: number } {
    return {
      created: PointPool.createdCount,
      released: PointPool.releasedCount,
      available: PointPool.instance ? PointPool.instance.getAvailableCount() : 0
    };
  }
}

/**
 * 路径对象池，用于优化绘图路径的创建和回收
 */
export class PathPool {
  private static instance: SimpleObjectPool<{
    id: string;
    points: {x: number, y: number}[];
    color: string;
    strokeWidth: number;
    opacity: number;
    brushType?: string;
    brushSettings?: any;
  }>;
  private static createdCount: number = 0;
  private static releasedCount: number = 0;
  
  /**
   * 获取路径对象池的单例
   */
  static getInstance(): ObjectPool<{
    id: string;
    points: {x: number, y: number}[];
    color: string;
    strokeWidth: number;
    opacity: number;
    brushType?: string;
    brushSettings?: any;
  }> {
    if (!PathPool.instance) {
      console.log('[PathPool] Initializing pool');
      PathPool.instance = new SimpleObjectPool<{
        id: string;
        points: {x: number, y: number}[];
        color: string;
        strokeWidth: number;
        opacity: number;
        brushType?: string;
        brushSettings?: any;
      }>(
        // 创建新路径的工厂函数
        () => {
          PathPool.createdCount++;
          console.log('[PathPool] Creating new path, total created:', PathPool.createdCount);
          return {
            id: '',
            points: [],
            color: '#000000',
            strokeWidth: 1,
            opacity: 1
          };
        },
        // 重置路径的函数
        (path) => {
          path.id = '';
          path.points.length = 0;
          path.color = '#000000';
          path.strokeWidth = 1;
          path.opacity = 1;
          path.brushType = undefined;
          path.brushSettings = undefined;
        },
        // 初始池大小
        10,
        // 最大池大小
        50
      );
    }
    return PathPool.instance;
  }
  
  /**
   * 创建一个新路径
   */
  static create(
    id: string,
    points: {x: number, y: number}[] = [],
    color: string = '#000000',
    strokeWidth: number = 1,
    opacity: number = 1,
    brushType?: string,
    brushSettings?: any
  ): {
    id: string;
    points: {x: number, y: number}[];
    color: string;
    strokeWidth: number;
    opacity: number;
    brushType?: string;
    brushSettings?: any;
  } {
    console.log(`[PathPool] Creating path: ${id} with ${points.length} points`);
    try {
      const path = PathPool.getInstance().acquire();
      path.id = id;
      path.points = [...points];
      path.color = color;
      path.strokeWidth = strokeWidth;
      path.opacity = opacity;
      path.brushType = brushType;
      path.brushSettings = brushSettings;
      console.log('[PathPool] Path created successfully');
      return path;
    } catch (error) {
      console.error('[PathPool] Error creating path:', error);
      // 回退到简单对象创建
      return {
        id,
        points: [...points],
        color,
        strokeWidth,
        opacity,
        brushType,
        brushSettings
      };
    }
  }
  
  /**
   * 释放一个路径
   */
  static release(path: {
    id: string;
    points: {x: number, y: number}[];
    color: string;
    strokeWidth: number;
    opacity: number;
    brushType?: string;
    brushSettings?: any;
  }): void {
    console.log(`[PathPool] Releasing path: ${path.id} with ${path.points.length} points`);
    try {
      // 先释放点数组
      PointPool.releaseArray(path.points);
      // 再释放路径对象
      PathPool.getInstance().release(path);
      PathPool.releasedCount++;
      console.log('[PathPool] Path released, total released:', PathPool.releasedCount);
    } catch (error) {
      console.error('[PathPool] Error releasing path:', error);
    }
  }
  
  /**
   * 获取池统计信息
   */
  static getStats(): { created: number; released: number; available: number } {
    return {
      created: PathPool.createdCount,
      released: PathPool.releasedCount,
      available: PathPool.instance ? PathPool.instance.getAvailableCount() : 0
    };
  }
}

/**
 * 变换对象池
 * 用于优化变换矩阵和变换操作
 */
export class TransformPool {
  private static instance: SimpleObjectPool<{
    position: {x: number, y: number};
    scale: number;
    rotation: number;
  }>;
  
  /**
   * 获取变换对象池的单例
   */
  static getInstance(): ObjectPool<{
    position: {x: number, y: number};
    scale: number;
    rotation: number;
  }> {
    if (!TransformPool.instance) {
      TransformPool.instance = new SimpleObjectPool<{
        position: {x: number, y: number};
        scale: number;
        rotation: number;
      }>(
        // 创建新变换的工厂函数
        () => ({
          position: { x: 0, y: 0 },
          scale: 1,
          rotation: 0
        }),
        // 重置变换的函数
        (transform) => {
          transform.position.x = 0;
          transform.position.y = 0;
          transform.scale = 1;
          transform.rotation = 0;
        },
        // 初始池大小
        20,
        // 最大池大小
        100
      );
    }
    return TransformPool.instance;
  }
  
  /**
   * 创建一个新变换
   */
  static create(
    x: number = 0,
    y: number = 0,
    scale: number = 1,
    rotation: number = 0
  ): {
    position: {x: number, y: number};
    scale: number;
    rotation: number;
  } {
    const transform = TransformPool.getInstance().acquire();
    transform.position.x = x;
    transform.position.y = y;
    transform.scale = scale;
    transform.rotation = rotation;
    return transform;
  }
  
  /**
   * 释放一个变换
   */
  static release(transform: {
    position: {x: number, y: number};
    scale: number;
    rotation: number;
  }): void {
    TransformPool.getInstance().release(transform);
  }
} 