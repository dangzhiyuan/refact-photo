import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useEditorStore } from "../../store/editorStore";
import { COLORS } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";

interface FilterPanelProps {
  onIntensityToggle: () => void;
  onClose?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  onIntensityToggle,
  onClose,
}) => {
  const currentFilter = useEditorStore((state) => state.currentFilter);
  const setFilter = useEditorStore((state) => state.setFilter);
  const baseImageUri = useEditorStore((state) => state.baseImageUri);
  const [activeCategory, setActiveCategory] = useState("推荐");

  const categories = ["推荐", "基础", "创意", "黑白", "复古"];

  const defaultImageSource = require("../../../assets/icon.png");

  const imageSource = baseImageUri ? { uri: baseImageUri } : defaultImageSource;

  const filters = [
    { id: "normal", name: "原图", icon: null },
    { id: "lut1", name: "清新", icon: null },
    { id: "lut2", name: "明亮", icon: null },
    { id: "lut3", name: "电影", icon: "lock" },
    { id: "lut4", name: "复古", icon: null },
    { id: "lut5", name: "低饱和", icon: null },
  ];

  const handleFilterSelect = (filterId: string) => {
    setFilter(filterId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>滤镜</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons
              name="close-outline"
              size={24}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 分类选项卡 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                activeCategory === category && styles.activeCategoryTab,
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === category && styles.activeCategoryText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 滤镜选项 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={styles.filterOption}
              onPress={() => handleFilterSelect(filter.id)}
            >
              <View
                style={[
                  styles.filterImageContainer,
                  currentFilter === filter.id &&
                    styles.selectedFilterImageContainer,
                ]}
              >
                <Image
                  source={imageSource}
                  style={styles.filterImage}
                  resizeMode="cover"
                />
                {filter.icon && (
                  <View style={styles.lockOverlay}>
                    <Ionicons
                      name="lock-closed"
                      size={20}
                      color="white"
                      style={styles.lockIcon}
                    />
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.filterName,
                  currentFilter === filter.id && styles.selectedFilterName,
                ]}
              >
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.panelBackground,
    borderRadius: 12,
    margin: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: COLORS.canvasBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeCategoryTab: {
    backgroundColor: COLORS.accent + "15", // 使用与TextPanel一致的透明背景
    borderColor: COLORS.accent,
  },
  categoryText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  activeCategoryText: {
    color: COLORS.accent, // 使用强调色
    fontWeight: "500", // 与TextPanel一致的字重
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterOption: {
    alignItems: "center",
    marginRight: 16,
    width: 80,
  },
  filterImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedFilterImageContainer: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + "15", // 添加与TextPanel一致的背景色
  },
  filterImage: {
    width: 80,
    height: 80,
  },
  filterName: {
    color: COLORS.text.secondary,
    fontSize: 12,
    textAlign: "center",
  },
  selectedFilterName: {
    color: COLORS.accent,
    fontWeight: "500", // 与TextPanel一致的字重
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  lockIcon: {
    fontSize: 18,
  },
});
