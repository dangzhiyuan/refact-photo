import React, { FC, useState, useEffect } from "react";
import { Group, Image } from "@shopify/react-native-skia";
import { LayerRendererProps } from "../../../../types/renderer";
import { ImageLayer } from "../../../../types/layer";
import { calculateFitSize } from "../../../../utils/layoutUtils";
import { filterEngine } from "../../../tools/filters/FilterEngine";

export const ImageLayerRenderer: FC<LayerRendererProps> = ({
  layer,
  isSelected,
}) => {
  const imageLayer = layer as ImageLayer;
  const { imageSource, transform, opacity, filterType } = imageLayer;
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
    <Group
      transform={[
        { translateX: transform.position.x },
        { translateY: transform.position.y },
        { scale: transform.scale },
        { rotate: transform.rotation },
      ]}
      opacity={opacity}
    >
      <Image
        image={processedImage}
        width={fitSize.width}
        height={fitSize.height}
        fit="contain"
      />
    </Group>
  );
};
