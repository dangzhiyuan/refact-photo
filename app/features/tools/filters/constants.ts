import { FilterType } from "./types";

export const FILTER_TYPES: FilterType[] = [
  "normal",
  "warm",
  "vintage",
  "cold",
  "bw",
  "sepia",
  "fade",
  "magazine",
];

export const FILTER_NAMES: Record<FilterType, string> = {
  normal: "原图",
  warm: "暖色",
  vintage: "复古",
  cold: "冷色",
  bw: "黑白",
  sepia: "怀旧",
  fade: "褪色",
  magazine: "日杂",
};
