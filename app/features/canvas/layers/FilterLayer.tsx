import React, { FC } from "react";
import {
  Group,
  Image,
  useImage,
  Shader,
  ImageShader,
  Fill,
} from "@shopify/react-native-skia";
import { FILTER_SHADER } from "../../tools/filters/shaders/FilterShader";
import { ImageLayer } from "../../../types/layer";
import { getLutPath } from "../../tools/filters/utils/utils";
import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

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
  const hasLut = lutImage ? 1 : 0;

  if (!image) {
    return null;
  }

  const imageRect = {
    x: 0,
    y: 0,
    width: image.width() * layer.scale,
    height: image.height() * layer.scale,
  };

  return (
    <Group
      transform={[
        { translateX: layer.position.x },
        { translateY: layer.position.y },
        { scale: layer.scale },
        { rotate: layer.rotation },
      ]}
    >
      <Fill>
        <Shader
          source={FILTER_SHADER}
          uniforms={{
            intensity: layer.filterIntensity || 1,
            hasLut,
          }}
        >
          <ImageShader image={image} fit="cover" rect={imageRect} />
          {lutImage && (
            <ImageShader image={lutImage} fit="cover" rect={imageRect} />
          )}
        </Shader>
      </Fill>
    </Group>
  );
};
