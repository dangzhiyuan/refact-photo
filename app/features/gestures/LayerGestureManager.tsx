import React, { FC, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useLayerStore } from "../../store/useLayerStore";
import { LayerGestureHandler } from "./LayerGestureHandler";

export const LayerGestureManager: FC = () => {
  const layers = useLayerStore((state) => state.layers);

  const layersArray = useMemo(() => {
    return Array.from(layers.values()).sort((a, b) => b.zIndex - a.zIndex);
  }, [layers]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {layersArray.map((layer) => {
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
