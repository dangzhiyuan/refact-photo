import { SkImage, Skia } from "@shopify/react-native-skia";
import * as ImagePicker from "expo-image-picker";

// 将 base64 转换为预览 URI
export const getImagePreviewUri = async (image: SkImage): Promise<string> => {
  try {
    // 将 SkImage 转换为 base64
    const base64 = await image.encodeToBase64();
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error("Failed to create preview URI:", error);
    return "";
  }
};

// 从图库选择图片并转换为 SkImage
export const pickImage = async (): Promise<SkImage | null> => {
  try {
    // 请求权限
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Permission denied");
    }

    // 选择图片
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) {
      return null;
    }

    // 加载图片
    const response = await fetch(result.assets[0].uri);
    const buffer = await response.arrayBuffer();
    const skData = Skia.Data.fromBytes(new Uint8Array(buffer));
    const image = Skia.Image.MakeImageFromEncoded(skData);

    if (!image) {
      throw new Error("Failed to create image");
    }

    return image;
  } catch (error) {
    console.error("Failed to pick image:", error);
    return null;
  }
};
