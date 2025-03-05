import { SkFont } from "@shopify/react-native-skia";

export const getTextDimensions = (
  text: string,
  font: SkFont,
  fontSize: number
) => {
  const scaledFont = font.copy();
  scaledFont.setSize(fontSize);

  const width = scaledFont.getTextWidth(text);
  // 简化高度计算
  const height = fontSize * 1.2;

  return { width, height };
};
