import React, { useEffect, useState } from "react";
import { Group, Image, Circle } from "@shopify/react-native-skia";
import { ImageLayer } from "../../../types/layer";
import { calculateFitSize } from "../../../utils/layoutUtils";
import { filterEngine } from "../../tools/filters/FilterEngine";

interface FilterLayerProps {
  layer: ImageLayer;
  isSelected: boolean;
}

const FilterLayerComponent = ({ layer, isSelected }: FilterLayerProps) => {
  const {
    imageSource,
    transform,
    opacity,
    isVisible,
    filterType,
    filterIntensity = 1,
    isUpdatingFilter,
  } = layer;

  // 存储滤镜处理后的图片
  const [filteredImage, setFilteredImage] = useState(imageSource);
  const [isLoading, setIsLoading] = useState(false);

  // 当滤镜参数变化时更新图片
  useEffect(() => {
    let isMounted = true;
    const applyFilter = async () => {
      // 如果正在更新中，不执行滤镜应用
      if (isUpdatingFilter) return;

      // 如果是原图，直接使用原图
      if (!imageSource || filterType === "normal") {
        setFilteredImage(imageSource);
        return;
      }

      try {
        setIsLoading(true);

        const lutImage = await filterEngine.loadLut(filterType);
        if (!lutImage || !isMounted) return;

        const result = await filterEngine.applyFilter(
          imageSource,
          lutImage,
          filterIntensity,
          filterType
        );

        if (isMounted) {
          setFilteredImage(result || imageSource);
          setIsLoading(false); // 加载完成
        }
      } catch (error) {
        console.error("FilterLayer: Filter application failed", error);
        if (isMounted) {
          setIsLoading(false); // 出错时也要重置加载状态
          setFilteredImage(imageSource); // 出错时使用原图
        }
      }
    };

    applyFilter();
    return () => {
      isMounted = false;
    };
  }, [imageSource, filterType, filterIntensity, isUpdatingFilter]);

  // 如果图层不可见或没有图片源，返回 null
  if (!isVisible || !imageSource) {
    return null;
  }

  // 适配尺寸
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
        width={fitSize.width}
        height={fitSize.height}
        fit="contain"
      />
    </Group>
  );
};

// 使用 React.memo 包装组件
export const FilterLayer = React.memo(
  FilterLayerComponent,
  (prevProps, nextProps) => {
    // 优化重渲染条件
    const prevLayer = prevProps.layer;
    const nextLayer = nextProps.layer;

    return (
      prevLayer.imageSource === nextLayer.imageSource &&
      prevLayer.filterType === nextLayer.filterType &&
      prevLayer.filterIntensity === nextLayer.filterIntensity &&
      prevLayer.isVisible === nextLayer.isVisible &&
      prevLayer.opacity === nextLayer.opacity &&
      prevLayer.transform === nextLayer.transform &&
      prevProps.isSelected === nextProps.isSelected
    );
  }
);
