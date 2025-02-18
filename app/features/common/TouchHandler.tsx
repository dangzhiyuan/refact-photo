import React, { FC } from "react";
import { View, StyleSheet } from "react-native";
import { Canvas, Group } from "@shopify/react-native-skia";

interface TouchHandlerProps {
  children: React.ReactNode;
  onTouchStart?: (info: { x: number; y: number }) => void;
}

export const TouchHandler: FC<TouchHandlerProps> = ({
  children,
  onTouchStart,
}) => {
  const handleTouch = (event: any) => {
    if (onTouchStart) {
      const { locationX, locationY } = event.nativeEvent;
      onTouchStart({ x: locationX, y: locationY });
    }
  };

  return (
    <View style={styles.container} onTouchStart={handleTouch}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
