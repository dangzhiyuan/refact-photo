import React, { FC, useEffect, useState } from "react";
import { Group, Image } from "@shopify/react-native-skia";
import { ImageLayer } from "../../../types/layer";
import { calculateFitSize } from "../../../utils/layoutUtils";
import { filterEngine } from "../../tools/filters/FilterEngine";
import { LutType } from "../../../types/filter";

interface FilterLayerProps {
  layer: ImageLayer;
  isSelected: boolean;
}

export const FilterLayer: FC<FilterLayerProps> = ({ layer, isSelected }) => {
  const {
    imageSource,
    transform,
    opacity,
    isVisible,
    filterType,
    filterIntensity = 1,
  } = layer;

  // 使用 state 存储处理后的图片
  const [filteredImage, setFilteredImage] = useState(imageSource);

  // 当滤镜参数变化时更新图片
  useEffect(() => {
    let isMounted = true;

    const applyFilter = async () => {
      if (!imageSource || !filterType) {
        setFilteredImage(imageSource);
        return;
      }

      // 加载 LUT 图片
      const lutImage = await filterEngine.loadLut(filterType as LutType);
      if (!lutImage || !isMounted) return;

      // 应用滤镜
      const result = await filterEngine.applyFilter(
        imageSource,
        lutImage,
        filterIntensity
      );

      if (isMounted) {
        setFilteredImage(result || imageSource);
      }
    };

    applyFilter();

    return () => {
      isMounted = false;
    };
  }, [imageSource, filterType, filterIntensity]);

  // 如果图层不可见或没有图片源，返回 null
  if (!isVisible || !imageSource) {
    return null;
  }

  // 计算适配尺寸
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
        image={filteredImage}
        fit="contain"
        width={fitSize.width}
        height={fitSize.height}
      />
    </Group>
  );
};
