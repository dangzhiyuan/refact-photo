import React, { FC, useEffect } from "react";
import {
  Group,
  Image,
  useImage,
  Shader,
  ImageShader,
  Fill,
  Rect,
} from "@shopify/react-native-skia";
import { FILTER_SHADER } from "../../tools/filters/shaders/FilterShader";
import { ImageLayer } from "../../../types/layer";
import { getLutPath } from "../../tools/filters/utils/utils";
import { Dimensions } from "react-native";
import { ADJUSTMENT_SHADER } from "../../tools/adjustments/shaders/AdjustmentShader";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const LUT_SIZE = 512; // LUT 标准尺寸

interface FilterLayerProps {
  layer: ImageLayer;
  isSelected: boolean;
}

export const FilterLayer: FC<FilterLayerProps> = ({ layer, isSelected }) => {
  const image = useImage(layer.imageSource);
  const lutPath = layer.filterType && layer.filterType !== "normal" 
    ? getLutPath(layer.filterType) 
    : undefined;
  const lutImage = useImage(lutPath);

  useEffect(() => {
    if (image && lutImage) {
      console.log('Resources loaded:', {
        image: {
          width: image.width(),
          height: image.height(),
          scale: layer.scale,
        },
        lut: {
          width: lutImage.width(),
          height: lutImage.height(),
        },
      });
    }
  }, [image, lutImage, layer.scale]);

  if (!image) {
    console.log('Image not loaded:', layer.imageSource);
    return null;
  }

  if (!FILTER_SHADER) {
    console.error('Filter shader not initialized');
    return null;
  }

  try {
    const imageWidth = image.width() * layer.scale;
    const imageHeight = image.height() * layer.scale;

    // 添加调整着色器
    const renderWithAdjustments = (children: React.ReactNode) => {
      if (!layer.adjustments) return children;

      return (
        <Shader
          source={ADJUSTMENT_SHADER}
          uniforms={{
            brightness: layer.adjustments.brightness || 0,
            contrast: layer.adjustments.contrast || 0,
            saturation: layer.adjustments.saturation || 1,
            temperature: layer.adjustments.temperature || 0,
          }}
        >
          {children}
        </Shader>
      );
    };

    // 基础渲染，不使用滤镜
    if (!layer.filterType || layer.filterType === 'normal' || !lutImage) {
      return (
        <Group
          transform={[
            { translateX: layer.position.x },
            { translateY: layer.position.y },
            { scale: layer.scale },
            { rotate: layer.rotation },
          ]}
        >
          {renderWithAdjustments(
            <Image 
              image={image} 
              fit="cover"
              width={imageWidth}
              height={imageHeight}
            />
          )}
        </Group>
      );
    }

    // 使用滤镜的渲染
    return (
      <Group
        transform={[
          { translateX: layer.position.x },
          { translateY: layer.position.y },
          { scale: layer.scale },
          { rotate: layer.rotation },
        ]}
      >
        <Rect x={0} y={0} width={imageWidth} height={imageHeight}>
          {renderWithAdjustments(
            <Shader
              source={FILTER_SHADER}
              uniforms={{
                intensity: layer.filterIntensity ?? 1,
                hasLut: 1,
              }}
            >
              <ImageShader 
                image={image} 
                fit="cover" 
                rect={{
                  x: 0,
                  y: 0,
                  width: imageWidth,
                  height: imageHeight,
                }}
              />
              <ImageShader 
                image={lutImage} 
                fit="none"
                rect={{
                  x: 0,
                  y: 0,
                  width: LUT_SIZE,
                  height: LUT_SIZE,
                }}
              />
            </Shader>
          )}
        </Rect>
      </Group>
    );
  } catch (error) {
    console.error('Error rendering FilterLayer:', error);
    return null;
  }
};
