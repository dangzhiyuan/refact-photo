/**
 * 生成一个简单的伪随机唯一ID
 * 注意：这不是加密安全的，只用于简单的唯一标识符生成
 * @param prefix 可选前缀
 * @returns 唯一ID字符串
 */
export const generateId = (prefix: string = "id"): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}_${randomPart}`;
};
