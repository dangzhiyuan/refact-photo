/**
 * 应用常量文件
 * 集中管理所有应用级别的常量，确保一致性
 */

// 绘画相关常量
export const MAX_DRAWING_LAYERS = 5;
export const MAX_RECENT_COLORS = 10;

// 缩放限制
export const SCALE_LIMITS = {
  min: 0.5,
  max: 3,
};

// 画布类型名称
export const CANVAS_TYPES = {
  BASE: "base",
  CONTENT: "content",
  DRAWING: "drawing",
  CONTROL: "control",
  STICKER: "sticker",
}; 