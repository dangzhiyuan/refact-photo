import React, { FC, useEffect, useRef } from "react";
import { Image } from "@shopify/react-native-skia";
import { LayerRendererProps } from "../../../../types/renderer";
import { ImageLayer } from "../../../../types/layer";
import {
  calculateFitSize,
  calculateCenterPosition,
} from "../../../../utils/layoutUtils";
import { filterEngine } from "../../../tools/filters/FilterEngine";
import { BaseRenderer } from "./BaseRenderer";
import { useLayerStore } from "../../../../store/useLayerStore";
import { getCanvasDimensions } from "../../../../constants/layout";
import { LutType } from "../../../../assets/luts";

export const ImageLayerRenderer: FC<LayerRendererProps> = ({
  layer,
  isSelected,
}) => {
  const imageLayer = layer as ImageLayer;
  const { imageSource, filterType } = imageLayer;
  const { updateLayer } = useLayerStore();
  const initialRenderRef = useRef(true);

  useEffect(() => {
    if (filterType === "normal") {
      return;
    }

    let mounted = true;
    filterEngine
      .getOrProcessImage(imageSource, filterType as LutType, 1)
      .then((result) => {
        if (mounted && result) {
          updateLayer(imageLayer.id, {
            imageSource: result,
          });
        }
      });
    return () => {
      mounted = false;
    };
  }, [imageSource, filterType, updateLayer]);

  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;

      const { position, scale } = imageLayer.transform;
      const isDefaultPosition =
        Math.abs(position.x) < 10 && Math.abs(position.y) < 10;
      const isDefaultScale = Math.abs(scale - 1.0) < 0.1;

      if (isDefaultPosition && isDefaultScale) {
        const imageWidth = imageSource.width();
        const imageHeight = imageSource.height();

        const { canvasWidth, canvasHeight } = getCanvasDimensions();

        // 计算合适的缩放比例
        const widthRatio = (canvasWidth * 0.8) / imageWidth;
        const heightRatio = (canvasHeight * 0.8) / imageHeight;
        const newScale = Math.min(widthRatio, heightRatio);

        // 计算缩放后的尺寸
        const scaledWidth = imageWidth * newScale;
        const scaledHeight = imageHeight * newScale;

        // 计算居中位置
        const centerPosition = {
          x: (canvasWidth - scaledWidth) / 2,
          y: (canvasHeight - scaledHeight) / 2,
        };

        updateLayer(imageLayer.id, {
          transform: {
            ...imageLayer.transform,
            position: centerPosition,
            scale: newScale,
          },
        });

        console.log(
          `图片已自动居中: 位置(${centerPosition.x}, ${centerPosition.y}), 缩放: ${newScale}`
        );
      }
    }
  }, [imageLayer, imageSource, updateLayer]);

  const originalWidth = imageSource.width();
  const originalHeight = imageSource.height();

  return (
    <BaseRenderer layer={layer} isSelected={isSelected}>
      <Image
        image={imageSource}
        width={originalWidth}
        height={originalHeight}
      />
    </BaseRenderer>
  );
};
