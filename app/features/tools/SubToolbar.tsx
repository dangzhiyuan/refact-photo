import { View, StyleSheet, Animated } from "react-native";
import { FilterPanel } from "./filters/components/FilterPanel";
import { useEffect, useRef } from "react";
import { FilterName } from "./filters/shaders/FilterShader";
import { TextPanel } from "./text/components/TextPanel";

interface SubToolbarProps {
  type: "filter" | "template" | "draw" | "text" | "sticker" | null;
  imageUri?: string;
  onFilterChange: (type: FilterName, intensity: number) => void;
}

export const SubToolbar = ({
  type,
  imageUri = "",
  onFilterChange,
}: SubToolbarProps) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: type ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [type]);

  if (!type) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [200, 0],
              }),
            },
          ],
        },
      ]}
    >
      {type === "filter" && imageUri && (
        <FilterPanel imageUri={imageUri} onFilterChange={onFilterChange} />
      )}
      {type === "text" && <TextPanel />}
      {/* 其他工具的子菜单 */}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    height: 200,
  },
});
