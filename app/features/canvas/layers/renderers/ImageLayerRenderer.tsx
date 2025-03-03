import React, { FC, useState, useEffect } from "react";
import { Image } from "@shopify/react-native-skia";
import { LayerRendererProps } from "../../../../types/renderer";
import { ImageLayer } from "../../../../types/layer";
import { calculateFitSize } from "../../../../utils/layoutUtils";
import { filterEngine } from "../../../tools/filters/FilterEngine";
import { BaseRenderer } from "./BaseRenderer";

export const ImageLayerRenderer: FC<LayerRendererProps> = ({
  layer,
  isSelected,
}) => {
  const imageLayer = layer as ImageLayer;
  const { imageSource, filterType } = imageLayer;
  const [processedImage, setProcessedImage] = useState(imageSource);

  useEffect(() => {
    if (filterType === "normal") {
      setProcessedImage(imageSource);
      return;
    }

    let mounted = true;
    filterEngine
      .getOrProcessImage(imageSource, filterType, 1)
      .then((result) => {
        if (mounted && result) {
          setProcessedImage(result);
        }
      });
    return () => {
      mounted = false;
    };
  }, [imageSource, filterType]);

  const fitSize = calculateFitSize(imageSource.width(), imageSource.height());

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
};
