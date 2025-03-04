import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { useStickerStore } from "../../store/stickerStore";

// 模拟贴纸数据
const STICKERS = [
  { id: 'sticker1', uri: 'https://via.placeholder.com/100?text=S1', name: '贴纸1' },
  { id: 'sticker2', uri: 'https://via.placeholder.com/100?text=S2', name: '贴纸2' },
  { id: 'sticker3', uri: 'https://via.placeholder.com/100?text=S3', name: '贴纸3' },
  { id: 'sticker4', uri: 'https://via.placeholder.com/100?text=S4', name: '贴纸4' },
  { id: 'sticker5', uri: 'https://via.placeholder.com/100?text=S5', name: '贴纸5' },
  { id: 'sticker6', uri: 'https://via.placeholder.com/100?text=S6', name: '贴纸6' },
];

// 定义分类
const CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'recent', name: '最近' },
  { id: 'text', name: '文字' },
  { id: 'decor', name: '装饰' },
];

export const StickerPanel = () => {
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const { addSticker } = useStickerStore();
  
  // 添加贴纸
  const handleAddSticker = (stickerUri: string) => {
    // 计算屏幕中心位置
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    
    addSticker(stickerUri, {
      x: windowWidth / 2 - 50, // 假设贴纸宽度为100
      y: windowHeight / 2 - 50, // 假设贴纸高度为100
    });
  };

  return (
    <View style={styles.container}>
      {/* 分类选择器 */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoriesList}
      >
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategory === category.id && styles.selectedCategoryItem
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 贴纸网格 */}
      <ScrollView style={styles.stickersContainer}>
        <View style={styles.stickersGrid}>
          {STICKERS.map(sticker => (
            <TouchableOpacity
              key={sticker.id}
              style={styles.stickerItem}
              onPress={() => handleAddSticker(sticker.uri)}
            >
              <Image
                source={{ uri: sticker.uri }}
                style={styles.stickerPreview}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    height: 250, // 固定高度
  },
  categoriesList: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  selectedCategoryItem: {
    backgroundColor: "#000",
  },
  categoryText: {
    fontSize: 14,
  },
  selectedCategoryText: {
    color: "#fff",
  },
  stickersContainer: {
    flex: 1,
  },
  stickersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
  },
  stickerItem: {
    width: "33.33%",
    padding: 5,
    aspectRatio: 1,
  },
  stickerPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 5,
  },
}); 