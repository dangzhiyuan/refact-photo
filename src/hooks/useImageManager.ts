import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { Skia } from "@shopify/react-native-skia";

interface ImageManagerError {
  code: "PERMISSION_DENIED" | "PICKER_CANCELLED" | "UNKNOWN_ERROR";
  message: string;
}

export const useImageManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ImageManagerError | null>(null);

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

  // 请求权限 - 专注于权限管理
  const requestPermissions = async () => {
    try {
      const imagePermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!imagePermission.granted) {
        setError({
          code: "PERMISSION_DENIED",
          message: "需要相册访问权限",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("权限请求失败:", error);
      setError({
        code: "UNKNOWN_ERROR",
        message: "权限请求失败，请确保应用有足够的权限。",
      });
      return false;
    }
  };

  // 专注于图片选择功能
  const pickImage = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const hasPermission = await requestPermissions();
      if (!hasPermission) return null;

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
        return null;
      }

      if (result.assets[0]) {
        return { uri: result.assets[0].uri };
      }
      return null;
    } catch (error) {
      console.error("选择图片失败:", error);
      setError({
        code: "UNKNOWN_ERROR",
        message: "选择图片失败",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

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
