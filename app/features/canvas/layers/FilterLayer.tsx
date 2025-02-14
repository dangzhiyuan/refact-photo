import React, { FC } from "react";
import {
  Group,
  useImage,
  Shader,
  ImageShader,
  Rect,
} from "@shopify/react-native-skia";
import { FILTER_SHADER } from "../../tools/filters/shaders/FilterShader";
import { ImageLayer } from "../../../types/layer";
import { getLutPath } from "../../tools/filters/utils/utils";

interface FilterLayerProps {
  layer: ImageLayer;
  isSelected: boolean;
}

export const FilterLayer: FC<FilterLayerProps> = ({ layer, isSelected }) => {
  const image = useImage(layer.imageSource);
  const lutPath =
    layer.filterType && layer.filterType !== "normal"
      ? getLutPath(layer.filterType)
      : undefined;

  const lutImage = useImage(lutPath);

  if (!image) {
    return null;
  }

  const imageWidth = image.width();
  const imageHeight = image.height();

  // 基础图层组
  const baseGroup = (
    <Group
      transform={[
        { translateX: layer.position.x },
        { translateY: layer.position.y },
        { scale: layer.scale },
        { rotate: layer.rotation },
      ]}
    >
      <Rect x={0} y={0} width={imageWidth} height={imageHeight}>
        <ImageShader
          image={image}
          fit="cover"
          rect={{ x: 0, y: 0, width: imageWidth, height: imageHeight }}
        />
      </Rect>
    </Group>
  );

  // 如果是 normal 或没有 LUT，返回基础图层
  if (layer.filterType === "normal" || !lutImage) {
    return baseGroup;
  }

  // 返回带滤镜的图层
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
        <Shader
          source={FILTER_SHADER}
          uniforms={{
            intensity: layer.filterIntensity || 0,
            hasLut: 1,
          }}
        >
          <ImageShader
            image={image}
            fit="cover"
            rect={{ x: 0, y: 0, width: imageWidth, height: imageHeight }}
          />
          <ImageShader
            image={lutImage}
            fit="cover"
            rect={{ x: 0, y: 0, width: 512, height: 512 }}
          />
        </Shader>
      </Rect>
    </Group>
  );
};
