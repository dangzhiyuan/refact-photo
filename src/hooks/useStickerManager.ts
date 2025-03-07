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

export interface StickerItem {
  uri: string;
  width: number;
  height: number;
}

export const useStickerManager = () => {
  const { addLayer, selectLayer } = useCanvasStore();

  const addSticker = useCallback(
    (sticker: StickerItem) => {
      try {
        // 创建一个适合屏幕的初始矩阵
        const src = rect(0, 0, sticker.width, sticker.height);
        const dst = rect(0, 0, width, height);
        // 使贴纸初始大小适合屏幕，留有边距
        const padding = 50;
        const dstWithPadding = rect(
          padding,
          padding,
          width - padding * 2,
          height - padding * 2
        );

        // 计算适合的矩阵变换
        const m3 = processTransform2d(fitbox("contain", src, dstWithPadding));
        const matrix = makeMutable(m3);

        // 添加贴纸图层
        const layerId = addLayer({
          type: LayerType.STICKER,
          stickerUri: sticker.uri,
          width: sticker.width,
          height: sticker.height,
          zIndex: Date.now(),
          visible: true,
          opacity: 1,
          matrix,
          transform: {
            position: { x: 0, y: 0 },
            scale: 1,
            rotation: 0,
          },
        } as Omit<StickerLayer, "id">);

        // 选中新添加的贴纸
        selectLayer(layerId);

        return layerId;
      } catch (error) {
        console.error("添加贴纸时出错:", error);
        throw error;
      }
    },
    [addLayer, selectLayer]
  );

  return {
    addSticker,
  };
};
