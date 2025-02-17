# PhotoPixel 导出系统实现文档

## 1. 系统架构

### 1.1 核心功能模块

- 导出引擎：处理不同格式的导出
- 格式转换：支持多种图片格式转换
- 质量控制：图片质量和大小优化
- 批量处理：支持批量导出功能

### 1.2 基础数据结构

```typescript
// 导出选项
interface ExportOptions {
  format: ExportFormat;
  quality: number; // 0-1
  dimensions?: {
    width: number;
    height: number;
  };
  compression: CompressionLevel;
  metadata: boolean;
  includeHistory: boolean;
}

// 导出格式
type ExportFormat =
  | 'png'
  | 'jpeg'
  | 'webp'
  | 'pxp' // PhotoPixel 项目文件
  | 'pdf'
  | 'svg';

// 压缩级别
type CompressionLevel = 'none' | 'low' | 'medium' | 'high';

// 导出任务
interface ExportTask {
  id: string;
  projectId: string;
  options: ExportOptions;
  status: ExportStatus;
  progress: number;
  result?: ExportResult;
  error?: Error;
  startTime: number;
  endTime?: number;
}

// 导出结果
interface ExportResult {
  file: Blob;
  format: ExportFormat;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  metadata: Record<string, any>;
}
```

## 2. 核心功能实现

### 2.1 导出管理器

```typescript
class ExportManager {
  private tasks: Map<string, ExportTask> = new Map();
  private workers: Worker[] = [];
  private maxWorkers = 4;

  // 创建导出任务
  async createExportTask(
    project: Project,
    options: ExportOptions,
  ): Promise<ExportTask> {
    const task: ExportTask = {
      id: generateId(),
      projectId: project.id,
      options,
      status: 'pending',
      progress: 0,
      startTime: Date.now(),
    };

    this.tasks.set(task.id, task);
    await this.startExport(task, project);
    return task;
  }

  // 开始导出
  private async startExport(task: ExportTask, project: Project): Promise<void> {
    try {
      // 更新任务状态
      task.status = 'processing';
      this.updateTask(task);

      // 根据格式选择导出器
      const exporter = this.getExporter(task.options.format);

      // 准备导出数据
      const data = await this.prepareExportData(project, task.options);

      // 执行导出
      const result = await exporter.export(data, task.options, progress => {
        task.progress = progress;
        this.updateTask(task);
      });

      // 更新任务状态
      task.status = 'completed';
      task.result = result;
      task.endTime = Date.now();
      this.updateTask(task);
    } catch (error) {
      // 处理错误
      task.status = 'failed';
      task.error = error as Error;
      task.endTime = Date.now();
      this.updateTask(task);
      throw error;
    }
  }

  // 取消导出任务
  async cancelExportTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task || task.status === 'completed' || task.status === 'failed')
      return;

    task.status = 'cancelled';
    task.endTime = Date.now();
    this.updateTask(task);

    // 清理相关资源
    await this.cleanupTask(task);
  }

  // 批量导出
  async batchExport(
    projects: Project[],
    options: ExportOptions,
  ): Promise<ExportTask[]> {
    const tasks: ExportTask[] = [];

    // 创建所有任务
    for (const project of projects) {
      const task = await this.createExportTask(project, options);
      tasks.push(task);
    }

    return tasks;
  }
}
```

### 2.2 格式导出器

```typescript
// 基础导出器接口
interface Exporter {
  export(
    data: ExportData,
    options: ExportOptions,
    onProgress: (progress: number) => void,
  ): Promise<ExportResult>;
}

// PNG 导出器
class PNGExporter implements Exporter {
  async export(
    data: ExportData,
    options: ExportOptions,
    onProgress: (progress: number) => void,
  ): Promise<ExportResult> {
    // 创建画布
    const canvas = new OffscreenCanvas(
      options.dimensions?.width || data.width,
      options.dimensions?.height || data.height,
    );
    const ctx = canvas.getContext('2d')!;

    // 渲染图层
    await this.renderLayers(data.layers, ctx, onProgress);

    // 导出为 PNG
    const blob = await canvas.convertToBlob({
      type: 'image/png',
    });

    return {
      file: blob,
      format: 'png',
      size: blob.size,
      dimensions: {
        width: canvas.width,
        height: canvas.height,
      },
      metadata: this.extractMetadata(data, options),
    };
  }
}

// JPEG 导出器
class JPEGExporter implements Exporter {
  async export(
    data: ExportData,
    options: ExportOptions,
    onProgress: (progress: number) => void,
  ): Promise<ExportResult> {
    // 创建画布
    const canvas = new OffscreenCanvas(
      options.dimensions?.width || data.width,
      options.dimensions?.height || data.height,
    );
    const ctx = canvas.getContext('2d')!;

    // 设置白色背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 渲染图层
    await this.renderLayers(data.layers, ctx, onProgress);

    // 导出为 JPEG
    const blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: options.quality,
    });

    return {
      file: blob,
      format: 'jpeg',
      size: blob.size,
      dimensions: {
        width: canvas.width,
        height: canvas.height,
      },
      metadata: this.extractMetadata(data, options),
    };
  }
}
```

### 2.3 质量优化器

```typescript
class QualityOptimizer {
  // 优化图片质量
  async optimizeQuality(
    blob: Blob,
    options: {
      targetSize?: number;
      minQuality?: number;
      maxQuality?: number;
    },
  ): Promise<Blob> {
    let low = options.minQuality || 0.1;
    let high = options.maxQuality || 1.0;
    let result = blob;

    while (high - low > 0.05) {
      const mid = (low + high) / 2;
      const compressed = await this.compressImage(blob, mid);

      if (compressed.size <= (options.targetSize || Infinity)) {
        low = mid;
        result = compressed;
      } else {
        high = mid;
      }
    }

    return result;
  }

  // 压缩图片
  private async compressImage(blob: Blob, quality: number): Promise<Blob> {
    const img = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(img, 0, 0);

    return canvas.convertToBlob({
      type: blob.type,
      quality,
    });
  }
}
```

## 3. 性能优化

### 3.1 并行处理

```typescript
class ParallelProcessor {
  private workers: Worker[] = [];
  private taskQueue: ExportTask[] = [];
  private maxWorkers: number;

  constructor(maxWorkers = navigator.hardwareConcurrency || 4) {
    this.maxWorkers = maxWorkers;
  }

  // 添加任务
  addTask(task: ExportTask): void {
    this.taskQueue.push(task);
    this.processQueue();
  }

  // 处理队列
  private async processQueue(): Promise<void> {
    while (this.workers.length < this.maxWorkers && this.taskQueue.length > 0) {
      const task = this.taskQueue.shift()!;
      const worker = await this.createWorker();
      this.workers.push(worker);

      worker.postMessage({
        type: 'export',
        task,
      });
    }
  }

  // 创建工作线程
  private async createWorker(): Promise<Worker> {
    const worker = new Worker(new URL('./export.worker', import.meta.url));

    worker.onmessage = ({data}) => {
      if (data.type === 'complete') {
        this.handleTaskComplete(worker, data.result);
      } else if (data.type === 'error') {
        this.handleTaskError(worker, data.error);
      }
    };

    return worker;
  }
}
```

### 3.2 内存管理

```typescript
class MemoryManager {
  private maxMemoryUsage = 512 * 1024 * 1024; // 512MB
  private currentMemoryUsage = 0;

  // 检查内存使用
  async checkMemoryUsage(size: number): Promise<boolean> {
    if (this.currentMemoryUsage + size > this.maxMemoryUsage) {
      await this.reduceMemoryUsage();
    }
    return this.currentMemoryUsage + size <= this.maxMemoryUsage;
  }

  // 减少内存使用
  private async reduceMemoryUsage(): Promise<void> {
    // 清理缓存
    this.clearCache();
    // 请求垃圾回收
    if (global.gc) {
      global.gc();
    }
  }
}
```

## 4. 用户界面集成

### 4.1 导出对话框

```typescript
const ExportDialog: FC<{project: Project}> = ({project}) => {
  const [options, setOptions] = useState<ExportOptions>(defaultExportOptions);
  const [task, setTask] = useState<ExportTask | null>(null);

  return (
    <Dialog>
      <ExportOptions
        options={options}
        onChange={setOptions}
        project={project}
      />
      <ExportPreview project={project} options={options} />
      <ExportProgress task={task} />
      <DialogActions>
        <Button onClick={handleCancel}>取消</Button>
        <Button onClick={handleExport} disabled={!!task}>
          导出
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ExportOptions: FC<ExportOptionsProps> = ({
  options,
  onChange,
  project,
}) => {
  return (
    <View style={styles.options}>
      <FormatSelector
        value={options.format}
        onChange={format => onChange({...options, format})}
      />
      <QualitySlider
        value={options.quality}
        onChange={quality => onChange({...options, quality})}
      />
      <DimensionsInput
        dimensions={options.dimensions}
        onChange={dimensions => onChange({...options, dimensions})}
        originalDimensions={project.metadata.dimensions}
      />
      <CompressionSelector
        value={options.compression}
        onChange={compression => onChange({...options, compression})}
      />
    </View>
  );
};
```

### 4.2 批量导出界面

```typescript
const BatchExportDialog: FC<{projects: Project[]}> = ({projects}) => {
  const [options, setOptions] = useState<ExportOptions>(defaultExportOptions);
  const [tasks, setTasks] = useState<ExportTask[]>([]);

  return (
    <Dialog>
      <ProjectList projects={projects} />
      <ExportOptions options={options} onChange={setOptions} />
      <BatchExportProgress tasks={tasks} />
      <DialogActions>
        <Button onClick={handleCancel}>取消</Button>
        <Button onClick={handleExport} disabled={tasks.length > 0}>
          批量导出
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

## 5. 系统优势

1. **多格式支持**

   - 常见图片格式
   - 项目文件格式
   - 矢量图格式
   - PDF 导出

2. **高性能处理**

   - 并行处理
   - 内存优化
   - 渐进式处理
   - 后台导出

3. **质量控制**

   - 智能压缩
   - 质量优化
   - 大小控制
   - 格式建议

4. **用户友好**
   - 实时预览
   - 进度反馈
   - 批量处理
   - 错误恢复

## 6. 注意事项

1. **性能优化**

   - 内存使用
   - 并行处理
   - 任务队列
   - 资源释放

2. **质量控制**

   - 压缩算法
   - 格式选择
   - 大小平衡
   - 元数据保留

3. **错误处理**

   - 导出失败
   - 内存不足
   - 格式兼容
   - 任务中断

4. **用户体验**
   - 进度提示
   - 预览功能
   - 参数建议
   - 错误提示
