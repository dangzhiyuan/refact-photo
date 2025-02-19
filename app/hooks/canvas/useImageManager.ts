import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useLayerStore } from "../../store/useLayerStore";
import { Skia } from "@shopify/react-native-skia";
import { createImageLayer } from "../../store/useCanvasStore";

interface ImageManagerError {
  code: "PERMISSION_DENIED" | "PICKER_CANCELLED" | "UNKNOWN_ERROR";
  message: string;
}

export const useImageManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ImageManagerError | null>(null);
  const { addLayer } = useLayerStore();

  // 加载图片为 SkImage
  const loadImage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const skData = Skia.Data.fromBytes(bytes);
      const image = Skia.Image.MakeImageFromEncoded(skData);

      if (!image) {
        throw new Error("Failed to create image");
      }

      return image;
    } catch (error) {
      console.error("Image loading failed:", error);
      throw error;
    }
  };

  // 请求权限
  const requestPermissions = async () => {
    try {
      const [imagePermission, libraryPermission] = await Promise.all([
        ImagePicker.requestCameraPermissionsAsync(),
        MediaLibrary.requestPermissionsAsync(),
      ]);

      if (!imagePermission.granted || !libraryPermission.granted) {
        setError({
          code: "PERMISSION_DENIED",
          message: "需要相机和相册访问权限",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("权限请求失败:", error);
      setError({
        code: "UNKNOWN_ERROR",
        message: "权限请求失败",
      });
      return false;
    }
  };


  const pickImage = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) {
        setError({
          code: "PICKER_CANCELLED",
          message: "已取消选择图片",
        });
        return;
      }

      if (result.assets[0]) {
        const skImage = await loadImage(result.assets[0].uri);
        const layer = await createImageLayer(skImage);
        addLayer(layer);
      }
    } catch (error) {
      console.error("选择图片失败:", error);
      setError({
        code: "UNKNOWN_ERROR",
        message: "选择图片失败",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 拍照
  // const takePhoto = async () => {
  //   try {
  //     setIsLoading(true);
  //     setError(null);

  //     const hasPermission = await requestPermissions();
  //     if (!hasPermission) return;

  //     const result = await ImagePicker.launchCameraAsync({
  //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //       allowsEditing: false,
  //       quality: 1,
  //     });

  //     if (result.canceled) {
  //       setError({
  //         code: "PICKER_CANCELLED",
  //         message: "已取消拍照",
  //       });
  //       return;
  //     }

  //     if (result.assets[0]) {
  //       const skImage = await loadImage(result.assets[0].uri);
  //       const layer = await createImageLayer(skImage);
  //       addLayer(layer);
  //     }
  //   } catch (error) {
  //     console.error("拍照失败:", error);
  //     setError({
  //       code: "UNKNOWN_ERROR",
  //       message: "拍照失败",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // 清除错误
  const clearError = () => {
    setError(null);
  };

  return {
    isLoading,
    error,
    clearError,
    pickImage,
  };
};
