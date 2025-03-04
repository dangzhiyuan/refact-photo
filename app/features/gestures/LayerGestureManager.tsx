import React, { FC, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useLayerStore } from "../../store/useLayerStore";
import { LayerGestureHandler } from "./LayerGestureHandler";

export const LayerGestureManager: FC = () => {
  // 正确订阅 layers 状态
  const layers = useLayerStore((state) => state.layers);

  // 基于最新的 layers 状态计算层级排序
  const layersArray = useMemo(() => {
    console.log("LayerGestureManager: Found", layers.size, "layers");
    return Array.from(layers.values()).sort((a, b) => b.zIndex - a.zIndex);
  }, [layers]);

  console.log(
    "LayerGestureManager rendering with",
    layersArray.length,
    "layers"
  );

  return (
    <View style={styles.container} pointerEvents="box-none">
      {layersArray.map((layer) => {
        console.log(`Creating gesture handler for layer ${layer.id}`);
        return <LayerGestureHandler key={layer.id} layer={layer} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1500,
    backgroundColor: "transparent",
    pointerEvents: "box-none",
  },
});
