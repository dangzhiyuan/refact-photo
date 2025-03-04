import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEditorStore } from "../store/editorStore";
import { PhotoCanvas } from "../components/PhotoCanvas";
import { StickerCanvas } from "../components/StickerCanvas";
import { DrawingCanvas } from "../components/DrawingCanvas";
import { EditorToolbar } from "../components/EditorToolbar";
import { FilterPanel } from "../components/panels/FilterPanel";
import { StickerPanel } from "../components/panels/StickerPanel";
import { DrawingPanel } from "../components/panels/DrawingPanel";
import { TextPanel } from "../components/panels/TextPanel";
import { AdjustPanel } from "../components/panels/AdjustPanel";

export const EditorScreen = () => {
  const navigation = useNavigation();
  const { photo, editorMode, setEditorMode } = useEditorStore();
  
  // 如果没有照片，返回首页
  useEffect(() => {
    if (!photo.uri) {
      navigation.navigate("Home" as never);
    }
  }, [photo.uri, navigation]);
  
  // 渲染当前模式下的面板
  const renderPanel = () => {
    switch (editorMode) {
      case "filter":
        return <FilterPanel />;
      case "sticker":
        return <StickerPanel />;
      case "drawing":
        return <DrawingPanel />;
      case "text":
        return <TextPanel />;
      case "adjust":
        return <AdjustPanel />;
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text>返回</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Text>分享</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Text>保存</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.canvasContainer}>
        {/* Canvas层 */}
        <PhotoCanvas />
        <StickerCanvas />
        <DrawingCanvas />
      </View>
      
      {/* 编辑面板 */}
      {renderPanel()}
      
      {/* 底部工具栏 */}
      <EditorToolbar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    top:"1%",
    margin:10,
    padding: 10,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    marginLeft: 15,
  },
  canvasContainer: {
    flex: 1,
    // Canvas将堆叠在这个容器中
  },
}); 