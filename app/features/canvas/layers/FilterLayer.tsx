import React, { useEffect, useState, useMemo } from "react";
import { Group, Image, Circle } from "@shopify/react-native-skia";
import { ImageLayer } from "../../../types/layer";
import { calculateFitSize } from "../../../utils/layoutUtils";
import { filterEngine } from "../../tools/filters/FilterEngine";
import { useLayerStore } from "../../../store/useLayerStore";

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
    filterIntensity,
  } = layer;

  const { updateLayer } = useLayerStore();

  // 存储滤镜处理后的图片
  const [filteredImage, setFilteredImage] = useState(imageSource);

  // 当滤镜参数变化时更新图片
  useEffect(() => {
    let isCancelled = false;

    const applyFilter = async () => {
      if (filterType === "normal") {
        setFilteredImage(imageSource);
        return;
      }

      try {
        const result = await filterEngine.getOrProcessImage(
          imageSource,
          filterType,
          filterIntensity
        );

        if (!isCancelled) {
          setFilteredImage(result || imageSource);
        }
      } catch (error) {
        console.error("Filter application failed:", error);
      }
    };

    applyFilter();
    return () => {
      isCancelled = true;
    };
  }, [filterType, filterIntensity, imageSource]);

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
