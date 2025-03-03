import React, { FC, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useLayerStore } from "../../store/useLayerStore";
import { LayerGestureHandler } from "./LayerGestureHandler";

export const LayerGestureManager: FC = () => {
  // 使用useMemo减少重复计算
  const layers = useMemo(() => {
    const allLayers = useLayerStore.getState().layers;
    console.log("LayerGestureManager: Found", allLayers.size, "layers");
    return Array.from(allLayers.values()).sort((a, b) => b.zIndex - a.zIndex);
  }, [useLayerStore.getState().layers]);

  console.log("LayerGestureManager rendering with", layers.length, "layers");

  return (
    <View style={styles.container} pointerEvents="box-none">
      {layers.map((layer) => {
        console.log(`Creating gesture handler for layer ${layer.id}`);
        return <LayerGestureHandler key={layer.id} layer={layer} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1500, // 确保在大多数元素上面，但在测试框下面
    backgroundColor: "rgba(0,0,255,0.1)",
    pointerEvents: "box-none", // 确保事件可以穿透到非手势区域
  },
});
