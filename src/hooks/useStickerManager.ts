import { useCallback } from "react";
import { Dimensions, ImageSourcePropType } from "react-native";
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
  uri?: string; // 网络贴纸的URI
  width: number;
  height: number;
  localSource?: ImageSourcePropType; // 本地贴纸的资源引用
}

// 简单的UUID生成函数
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 创建延迟函数用于模拟加载时间
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 贴纸管理器Hook
 * 提供添加、删除、修改贴纸的功能
 */
export const useStickerManager = () => {
  const { addLayer, deleteLayer, updateLayer, layerIds, layers } =
    useCanvasStore();

  // 使用 useCallback 优化性能
  const addSticker = useCallback(
    async (stickerItem: StickerItem): Promise<string> => {
      console.log("开始添加贴纸...");

      // 检查是否是本地贴纸还是网络贴纸
      const isLocalSticker = !!stickerItem.localSource;

      // 只对网络贴纸添加延迟，本地贴纸不需要
      if (!isLocalSticker) {
        console.log("网络贴纸，添加延迟");
        await delay(1500);
      } else {
        console.log("本地贴纸，无需延迟");
      }

      // 创建唯一ID
      const id = generateUUID();

      // 计算合适的zIndex，确保不会始终覆盖其他图层
      // 获取现有图层中最大的zIndex，然后+1
      let maxZIndex = 0;
      for (const layerId of layerIds) {
        if (layers[layerId] && layers[layerId].zIndex > maxZIndex) {
          maxZIndex = layers[layerId].zIndex;
        }
      }

      // 创建贴纸图层对象
      const stickerLayer: Partial<StickerLayer> = {
        id,
        type: LayerType.STICKER,
        // 使用与现有 StickerLayer 类型匹配的属性
        stickerUri: isLocalSticker ? "" : stickerItem.uri, // 网络贴纸使用URI
        isLocalSticker: isLocalSticker, // 标记是本地贴纸
        localStickerSource: isLocalSticker
          ? stickerItem.localSource
          : undefined, // 本地资源引用
        width: stickerItem.width,
        height: stickerItem.height,
        visible: true,
        opacity: 1,
        zIndex: maxZIndex + 1, // 使用计算出的zIndex
        transform: {
          position: { x: 0, y: 0 },
          scale: 1,
          rotation: 0,
        },
      };

      console.log("贴纸准备就绪，添加到画布...");

      // 添加到画布
      addLayer(stickerLayer as StickerLayer);

      console.log("贴纸添加完成，ID:", id);
      return id;
    },
    [addLayer, layerIds, layers]
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
