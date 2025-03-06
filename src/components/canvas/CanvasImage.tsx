import React from "react";
import { Canvas, Image, SkImage } from "@shopify/react-native-skia";
import { StyleSheet, ViewStyle, StyleProp } from "react-native";

interface CanvasImageProps {
  image: SkImage | null;
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
}

export const CanvasImage = React.memo(
  ({ image, width, height, style }: CanvasImageProps) => {
    if (!image) return null;

    return (
      <Canvas style={[{ width, height }, style]}>
        <Image
          image={image}
          fit="fill"
          x={0}
          y={0}
          width={width}
          height={height}
        />
      </Canvas>
    );
  }
);
