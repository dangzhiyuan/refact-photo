import { useState, useEffect } from "react";
import { useImage } from "@shopify/react-native-skia";
import { useEditorStore } from "../store/editorStore";
import { Image } from "react-native";

// 判断是否为本地文件URI
const isFileUri = (uri: string | null): boolean => {
  return !!uri && uri.startsWith('file://');
};

// 从URI中提取文件扩展名
const getFileExtension = (uri: string | null): string => {
  if (!uri) return 'unknown';
  // 移除查询参数
  const path = uri.split('?')[0];
  const lastDot = path.lastIndexOf('.');
  return lastDot > 0 ? path.substring(lastDot + 1).toLowerCase() : 'unknown';
};

export function useImageLoader(defaultUrl: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadAttemptCount, setLoadAttemptCount] = useState(0);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [imageFormat, setImageFormat] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [dimensionsChecked, setDimensionsChecked] = useState(false);
  
  const baseImageUri = useEditorStore((state) => state.baseImageUri);
  const userImage = useImage(baseImageUri);
  const defaultImage = useImage(defaultUrl);
  const image = userImage || defaultImage;

  // 当图像URI改变时重置状态
  useEffect(() => {
    if (baseImageUri) {
      // 尝试从URI确定图像格式
      const extension = getFileExtension(baseImageUri);
      setImageFormat(extension);
      
      setIsLoading(true);
      setHasError(false);
      setImageError(null);
      setImageDimensions(null);
      setLoadAttemptCount(0);
      setDimensionsChecked(false);
    }
  }, [baseImageUri]);

  // 检查图像尺寸 - 只在URI变化且尚未检查尺寸时执行一次
  useEffect(() => {
    if (baseImageUri && !dimensionsChecked) {
      setDimensionsChecked(true); // 标记为已检查，防止重复执行
      
      // 获取图像尺寸
      Image.getSize(
        baseImageUri,
        (width, height) => {
          setImageDimensions({ width, height });
        },
        (error) => {
          const errorMsg = `图像获取尺寸失败: ${error.message || '未知错误'}`;
          setImageError(errorMsg);
          setHasError(true);
        }
      );
    }
  }, [baseImageUri, dimensionsChecked, imageFormat]);

  // 根据URI类型处理加载
  useEffect(() => {
    if (baseImageUri && !userImage && !hasError) {
      // 设置超时检查
      const timeoutId = setTimeout(() => {
        if (!userImage) {
          if (isFileUri(baseImageUri) && loadAttemptCount < 2) {
            setLoadAttemptCount(prev => prev + 1);
          } else {
            setIsLoading(false);
            setImageError(`图像加载超时，可能不支持此格式(${imageFormat})或尺寸过大`);
            setHasError(true);
          }
        }
      }, 3000 + loadAttemptCount * 1000); // 根据尝试次数增加超时时间
      
      return () => clearTimeout(timeoutId);
    }
  }, [baseImageUri, userImage, loadAttemptCount, imageFormat, imageDimensions, hasError]);

  // 当Skia图像加载完成时
  useEffect(() => {
    if (image) {
      try {
        // 尝试访问图像属性来确认它是否完全加载
        const width = image.width();
        const height = image.height();
        
        // 更新尺寸信息(可能与Image.getSize获取的不同)
        if (!imageDimensions) {
          setImageDimensions({ width, height });
        }
        
        setIsLoading(false);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '未知错误';
        setImageError(`Skia加载异常: ${errorMsg}`);
        setHasError(true);
        setIsLoading(false);
      }
    }
  }, [image]);

  return { 
    image, 
    isLoading, 
    hasError,
    errorMessage: imageError,
    // 添加额外信息用于调试
    debug: {
      imageType: userImage ? "user" : defaultImage ? "default" : "none",
      uri: baseImageUri,
      isFileUri: isFileUri(baseImageUri),
      format: imageFormat,
      dimensions: imageDimensions,
      loadAttempts: loadAttemptCount
    }
  };
}
