import { LutImages, LutType } from "../../../../assets/luts";

export const getLutPath = (name?: string) => {
  if (!name || name === "normal") return null;

  // 确保 name 是有效的 LUT 类型
  if (!(name in LutImages)) {
    console.warn(`Invalid LUT name: ${name}`);
    return null;
  }

  return LutImages[name as LutType];
};
