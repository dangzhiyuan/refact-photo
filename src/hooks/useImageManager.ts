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

  // 请求权限
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

  // 图片选择
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
