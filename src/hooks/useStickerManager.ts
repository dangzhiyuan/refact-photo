import { useCallback } from "react";
import { Dimensions } from "react-native";
import { useCanvasStore } from "../store/canvasStore";
import { CanvasType, LayerType, StickerLayer } from "../core/types/canvas";
import { makeMutable } from "react-native-reanimated";
import {
  Skia,
  processTransform2d,
  fitbox,
  rect,
} from "@shopify/react-native-skia";

const { width, height } = Dimensions.get("window");

// 贴纸数据类型
export interface StickerItem {
  uri: string;
  width: number;
  height: number;
}

// 简单的UUID生成函数
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 贴纸管理器Hook
 * 提供添加、删除、修改贴纸的功能
 */
export const useStickerManager = () => {
  const { addLayer, deleteLayer, updateLayer } = useCanvasStore();

  // 使用 useCallback 优化性能
  const addSticker = useCallback(
    async (stickerItem: StickerItem): Promise<string> => {
      // 创建唯一ID
      const id = generateUUID();

      // 创建贴纸图层对象
      const stickerLayer: Partial<StickerLayer> = {
        id,
        type: LayerType.STICKER,
        // 使用与现有 StickerLayer 类型匹配的属性
        stickerUri: stickerItem.uri,
        width: stickerItem.width,
        height: stickerItem.height,
        visible: true,
        opacity: 1,
        zIndex: Date.now(),
        transform: {
          position: { x: 0, y: 0 },
          scale: 1,
          rotation: 0,
        },
      };

      // 添加到画布
      addLayer(stickerLayer as StickerLayer);
      return id;
    },
    [addLayer]
  );

  const removeSticker = useCallback(
    (id: string) => {
      deleteLayer(id);
    },
    [deleteLayer]
  );

  const updateSticker = useCallback(
    (id: string, updates: Partial<StickerLayer>) => {
      updateLayer(id, updates);
    },
    [updateLayer]
  );

  return {
    addSticker,
    removeSticker,
    updateSticker,
  };
};
