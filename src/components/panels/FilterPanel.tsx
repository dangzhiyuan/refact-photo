import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useEditorStore } from "../../store/editorStore";

interface FilterPanelProps {
  onIntensityToggle: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  onIntensityToggle,
}) => {
  const { currentFilter, setFilter } = useEditorStore();

  // 滤镜类别
  const categories = [
    { id: "all", name: "全部" },
    { id: "popular", name: "热门", active: true },
    { id: "vintage", name: "古早" },
    { id: "film", name: "胶卷" },
    { id: "mono", name: "黑白" },
  ];

  // 滤镜列表
  // const filters = [
  //   {
  //     id: "normal",
  //     name: "原图",
  //     preview: require("../../assets/filters/normal.png"),
  //   },
  //   {
  //     id: "light",
  //     name: "轻柔",
  //     preview: require("../../assets/filters/light.png"),
  //   },
  //   {
  //     id: "soft",
  //     name: "初色",
  //     preview: require("../../assets/filters/soft.png"),
  //   },
  //   {
  //     id: "flow",
  //     name: "流云",
  //     preview: require("../../assets/filters/flow.png"),
  //     locked: true,
  //   },
  //   {
  //     id: "cool",
  //     name: "反差冷",
  //     preview: require("../../assets/filters/cool.png"),
  //   },
  //   {
  //     id: "warm",
  //     name: "富士",
  //     preview: require("../../assets/filters/warm.png"),
  //   },
  //   {
  //     id: "lowkey",
  //     name: "低饱和",
  //     preview: require("../../assets/filters/lowkey.png"),
  //   },
  // ];

  return (
    <View style={styles.container}>
      {/* 分类标签 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              category.active && styles.activeCategoryTab,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                category.active && styles.activeCategoryText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 滤镜列表 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {/* {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={styles.filterItem}
            onPress={() => {
              setFilter(filter.id);
              onIntensityToggle();
            }}
          >
            <View
              style={[
                styles.filterPreview,
                currentFilter === filter.id && styles.activeFilterPreview,
              ]}
            >
              <Image source={filter.preview} style={styles.filterImage} />
              {filter.locked && (
                <View style={styles.lockOverlay}>
                  <Text style={styles.lockIcon}>🔒</Text>
                </View>
              )}
            </View>
            <Text style={styles.filterName}>{filter.name}</Text>
          </TouchableOpacity>
        ))} */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "rgba(50, 50, 50, 0.5)",
  },
  activeCategoryTab: {
    backgroundColor: "rgba(255, 192, 203, 0.7)", // 淡粉色背景，匹配参考图
  },
  categoryText: {
    color: "#fff",
    fontSize: 14,
  },
  activeCategoryText: {
    fontWeight: "bold",
  },
  filtersContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  filterItem: {
    alignItems: "center",
    marginRight: 15,
    width: 70,
  },
  filterPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#555",
    marginBottom: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeFilterPreview: {
    borderColor: "#fff",
  },
  filterImage: {
    width: "100%",
    height: "100%",
  },
  filterName: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
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
