import React, { useEffect, useState } from "react";
import { Group, Image } from "@shopify/react-native-skia";
import { ImageLayer } from "../../../../types/layer";
import { calculateFitSize } from "../../../../utils/layoutUtils";
import { filterEngine } from "../../../tools/filters/FilterEngine";
import { BaseRenderer } from "./BaseRenderer";

interface ImageRendererProps {
  layer: ImageLayer;
  isSelected: boolean;
}

export const ImageRenderer = React.memo(
  ({ layer, isSelected }: ImageRendererProps) => {
    const [processedImage, setProcessedImage] = useState(layer.imageSource);

    // 处理滤镜
    useEffect(() => {
      // ... 滤镜处理逻辑
    }, [layer.filterType, layer.filterIntensity, layer.imageSource]);

    // 计算尺寸
    const fitSize = calculateFitSize(
      layer.imageSource.width(),
      layer.imageSource.height()
    );

    return (
      <BaseRenderer layer={layer} isSelected={isSelected}>
        <Image
          image={processedImage}
          width={fitSize.width}
          height={fitSize.height}
          fit="contain"
        />
      </BaseRenderer>
    );
  }
);
