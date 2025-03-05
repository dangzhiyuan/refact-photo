import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import Slider from "@react-native-community/slider";
import { CanvasView, CanvasViewRef } from "../features/canvas/CanvasView";
import { useNavigation } from "@react-navigation/native";
import { useBaseImageStore } from "../store/baseImageStore";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialIcons as MaterialIconsType } from "@expo/vector-icons/build/Icons";
import { FilterPanel } from "../features/tools/filters/components/FilterPanel";
import * as MediaLibrary from "expo-media-library";
import { FilterName } from "../features/tools/filters/shaders/FilterShader";
import { LutImages } from "../assets/luts";

const { width: screenWidth } = Dimensions.get("window");

// 定义图标名称类型
type IconName = keyof typeof MaterialIconsType.glyphMap;

// 滤镜类型
const FILTERS: Array<{ id: FilterName; name: string; icon: IconName | null }> =
  [
    { id: "normal", name: "原图", icon: "block" },
    { id: "light", name: "轻柔", icon: null },
    { id: "soft", name: "初色", icon: null },
    { id: "flow", name: "流云", icon: "lock" },
    { id: "cool", name: "反差冷", icon: null },
    { id: "warm", name: "富士", icon: null },
    { id: "lowkey", name: "低饱和", icon: null },
  ];

// 工具类型
const TOOLS: Array<{ id: ToolType; name: string; icon: IconName }> = [
  { id: "draw", name: "涂鸦", icon: "edit" },
  { id: "filter", name: "滤镜", icon: "filter" },
  { id: "sticker", name: "贴纸", icon: "stars" },
  { id: "emoji", name: "表情", icon: "sentiment-satisfied" },
  { id: "crop", name: "裁剪", icon: "crop" },
];

// 滤镜类型和颜色映射
const FILTER_COLORS: {
  [key: string]: string;
  normal: string;
  light: string;
  soft: string;
  flow: string;
  cool: string;
  warm: string;
  lowkey: string;
} = {
  normal: "#333",
  light: "#E8D9C0",
  soft: "#E4B6A2",
  flow: "#81A6BC",
  cool: "#6281A6",
  warm: "#D9A26E",
  lowkey: "#525D68",
  // 添加任何其他可能的滤镜 ID
};

// 在文件顶部定义类型
type ToolType = "draw" | "filter" | "sticker" | "emoji" | "crop";

export default function Editor() {
  const navigation = useNavigation();
  const canvasRef = useRef<CanvasViewRef>(null);
  const [activeTab, setActiveTab] = useState("filter");
  const [activeFilter, setActiveFilter] = useState<FilterName>("normal");
  const [filterIntensity, setFilterIntensity] = useState(0.5);

  // 使用baseImageStore来管理图片和滤镜
  const { setFilter, updateAdjustments } = useBaseImageStore();

  // 返回按钮点击
  const handleBack = () => {
    navigation.goBack();
  };

  // 保存/分享图片
  const handleShare = async () => {
    try {
      if (canvasRef.current) {
        // 截取图片
        const uri = await canvasRef.current.capture();
        console.log("截图完成：", uri);

        // 保存到相册
        const { status } = await MediaLibrary.requestPermissionsAsync();

        if (status === "granted") {
          const asset = await MediaLibrary.createAssetAsync(uri);
          await MediaLibrary.createAlbumAsync("Photo Editor", asset, false);
          Alert.alert("保存成功", "图片已保存到相册");
        } else {
          Alert.alert("权限被拒绝", "需要相册权限来保存图片");
        }
      }
    } catch (error) {
      console.error("保存失败:", error);
      Alert.alert("保存失败", String(error));
    }
  };

  // 选择工具
  const selectTool = (toolId: ToolType) => {
    setActiveTab(toolId);
  };

  // 处理滤镜变化 - 这是关键函数
  const handleFilterChange = (filterType: FilterName, intensity: number) => {
    console.log("应用滤镜:", filterType, "强度:", intensity);

    // 设置滤镜到baseImageStore
    setFilter(filterType === "normal" ? null : filterType);

    // 更新滤镜强度
    updateAdjustments({ intensity: intensity });

    // 更新UI状态
    setActiveFilter(filterType);
    setFilterIntensity(intensity);
  };

  // 渲染滤镜工具栏
  const renderFilterTools = () => {
    return (
      <View style={styles.bottomPanel}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map((filter) => {
            return (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterOption,
                  activeFilter === filter.id && styles.activeFilterOption,
                ]}
                onPress={() => handleFilterChange(filter.id, filterIntensity)}
              >
                {filter.icon === "lock" && (
                  <View style={styles.filterLockContainer}>
                    <MaterialIcons
                      name={"lock" as any}
                      size={16}
                      style={styles.lockIcon}
                      color="#fff"
                    />
                  </View>
                )}
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    backgroundColor:
                      FILTER_COLORS[filter.id as keyof typeof FILTER_COLORS] ||
                      "#333",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "500" }}>
                    {filter.name}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.filterName,
                    activeFilter === filter.id && styles.activeFilterName,
                  ]}
                >
                  {filter.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sliderContainer}>
          <Text style={styles.intensityValue}>
            {Math.round(filterIntensity * 100)}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={0.01}
            value={filterIntensity}
            onValueChange={(value) => {
              setFilterIntensity(value);
              // 只有当滤镜不是normal时，才应用强度调整
              if (activeFilter !== "normal") {
                handleFilterChange(activeFilter, value);
              }
            }}
          />
          <Text style={styles.intensityValue}>
            {Math.round(filterIntensity * 100)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <MaterialIcons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <MaterialIcons name="file-download" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <CanvasView ref={canvasRef} />
      </View>

      <View style={styles.toolbar}>
        {TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={[
              styles.toolButton,
              activeTab === tool.id && styles.activeToolButton,
            ]}
            onPress={() => selectTool(tool.id as ToolType)}
          >
            <MaterialIcons
              name={tool.icon as any}
              size={24}
              color={activeTab === tool.id ? "#fff" : "#aaa"}
            />
            <Text
              style={[
                styles.toolName,
                activeTab === tool.id && styles.activeToolName,
              ]}
            >
              {tool.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "filter" && renderFilterTools()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  content: {
    flex: 1,
  },
  toolbar: {
    backgroundColor: "#000",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  toolButton: {
    alignItems: "center",
  },
  activeToolButton: {},
  toolName: {
    color: "#aaa",
    marginTop: 4,
    fontSize: 12,
  },
  activeToolName: {
    color: "#fff",
  },
  bottomPanel: {
    paddingBottom: 24,
  },
  filterOption: {
    alignItems: "center",
    marginHorizontal: 8,
    width: 70,
  },
  activeFilterOption: {},
  filterLockContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  lockIcon: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  filterName: {
    color: "#aaa",
    marginTop: 8,
    fontSize: 13,
    textAlign: "center",
  },
  activeFilterName: {
    color: "#fff",
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  intensityValue: {
    color: "#fff",
    width: 30,
  },
  slider: {
    flex: 1,
    height: 40,
  },
});
