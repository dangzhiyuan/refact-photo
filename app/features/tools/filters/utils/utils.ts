import { LutImages, LutType } from "../../../../assets/luts";

export const getLutPath = (name: string) => {
  console.log("Utils - Getting LUT path:", {
    requestedName: name,
    availableLuts: Object.keys(LutImages),
  });

  // 确保 name 是有效的 LUT 类型
  if (!(name in LutImages)) {
    console.warn(`Invalid LUT name: ${name}`);
    return undefined;
  }

  // 获取实际的资源路径
  const lutResource = LutImages[name as LutType];
  console.log("Utils - Found LUT resource:", lutResource);

  return lutResource;
};
