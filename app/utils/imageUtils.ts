import { SkImage } from "@shopify/react-native-skia";

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
