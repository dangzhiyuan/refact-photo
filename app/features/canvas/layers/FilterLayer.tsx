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

  // 使用 state 存储处理后的图片
  const [filteredImage, setFilteredImage] = useState(imageSource);
  const [isLoading, setIsLoading] = useState(false);

  // 当滤镜参数变化时更新图片
  useEffect(() => {
    let isMounted = true;

    const applyFilter = async () => {
      // 如果正在更新中，不执行滤镜应用
      if (isUpdatingFilter) return;

      console.log("FilterLayer: Starting filter application", {
        filterType,
        filterIntensity,
        hasImage: !!imageSource,
      });

      if (!imageSource || filterType === "normal") {
        console.log("FilterLayer: Using original image");
        setFilteredImage(imageSource);
        return;
      }

      try {
        setIsLoading(true);

        // 加载 LUT 图片
        const lutImage = await filterEngine.loadLut(filterType);
        console.log("FilterLayer: LUT loaded", {
          success: !!lutImage,
          filterType,
        });

        if (!lutImage || !isMounted) {
          console.log("FilterLayer: No LUT or unmounted");
          return;
        }

        // 应用滤镜
        const result = await filterEngine.applyFilter(
          imageSource,
          lutImage,
          filterIntensity,
          filterType
        );

        console.log("FilterLayer: Filter applied", {
          success: !!result,
          filterType,
        });

        if (isMounted) {
          setFilteredImage(result || imageSource);
        }
      } catch (error) {
        console.error("FilterLayer: Filter application failed", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
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
        width={fitSize.width}
        height={fitSize.height}
        fit="contain"
      />
      {isLoading && (
        <Circle
          cx={fitSize.width / 2}
          cy={fitSize.height / 2}
          r={20}
          color="#007AFF"
        />
      )}
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
