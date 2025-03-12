import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { COLORS } from "../../theme/colors";
import { useStickerManager, StickerItem } from "../../hooks/useStickerManager";
import { Icon } from "../common/Icon";
import { useEditorStore } from "../../store/editorStore";

const { width: screenWidth } = Dimensions.get("window");

const LOCAL_STICKERS = [
  {
    source: require("../../assets/stickers/icon.png"),
    width: 100,
    height: 100,
    isLocal: true,
  },
  {
    source: require("../../assets/stickers/favicon.png"),
    width: 100,
    height: 100,
    isLocal: true,
  },
];

// 网络贴纸
const NETWORK_STICKERS: StickerItem[] = [
  {
    uri: "https://cdn-icons-png.flaticon.com/512/5661/5661642.png",
    width: 100,
    height: 100,
  },
  {
    uri: "https://cdn-icons-png.flaticon.com/512/3132/3132896.png",
    width: 100,
    height: 100,
  },
  {
    uri: "https://cdn-icons-png.flaticon.com/512/6831/6831000.png",
    width: 100,
    height: 100,
  },
  {
    uri: "https://cdn-icons-png.flaticon.com/512/3513/3513305.png",
    width: 100,
    height: 100,
  },
  {
    uri: "https://cdn-icons-png.flaticon.com/512/7694/7694379.png",
    width: 100,
    height: 100,
  },
  {
    uri: "https://cdn-icons-png.flaticon.com/512/6495/6495019.png",
    width: 100,
    height: 100,
  },
];

// 默认使用本地贴纸
const USE_LOCAL_STICKERS = true;

enum LoadingState {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

interface StickerPanelProps {
  onClose?: () => void;
  setActiveCanvas?: (id: string) => void; // 接收 setActiveCanvas 作为 prop
}

export const StickerPanel: React.FC<StickerPanelProps> = React.memo(
  ({ onClose, setActiveCanvas }) => {
    const { addSticker } = useStickerManager();
    const [loadingState, setLoadingState] = useState<LoadingState>(
      LoadingState.IDLE
    );
    const [selectedSticker, setSelectedSticker] = useState<number | null>(null);
    const [loadedSticker, setLoadedSticker] = useState<any | null>(null);
    const [useLocalStickers, setUseLocalStickers] =
      useState(USE_LOCAL_STICKERS);

    useEffect(() => {
      console.log("当前加载状态:", loadingState);
    }, [loadingState]);

    useEffect(() => {
      let timer: NodeJS.Timeout;
      if (loadingState === LoadingState.SUCCESS) {
        timer = setTimeout(() => {
          setLoadingState(LoadingState.IDLE);
          setSelectedSticker(null);
        }, 500);
      }
      return () => {
        if (timer) {
          console.log("清除定时器");
          clearTimeout(timer);
        }
      };
    }, [loadingState]);

    // 处理添加本地贴纸
    const handleAddLocalSticker = useCallback(
      async (sticker: any, index: number) => {
        if (loadingState !== LoadingState.IDLE) {
          console.log("加载状态中，忽略点击");
          return;
        }

        console.log("开始添加本地贴纸，索引:", index);
        setSelectedSticker(index);
        setLoadingState(LoadingState.LOADING);
        setLoadedSticker(sticker);

        try {
          // 本地贴纸加载速度快，不需要人为延迟
          // 将本地资源转换为 StickerItem 格式
          const localStickerItem: StickerItem = {
            uri: "",
            width: sticker.width,
            height: sticker.height,
            localSource: sticker.source,
          };

          console.log("调用 addSticker 方法添加本地贴纸");
          const layerId = await addSticker(localStickerItem);
          console.log("添加本地贴纸成功，ID:", layerId);

          if (setActiveCanvas) {
            console.log("设置活动画布为新贴纸图层");
            setActiveCanvas(layerId);
          }

          // 显示成功状态
          console.log("设置加载状态为成功");
          setLoadingState(LoadingState.SUCCESS);
        } catch (error) {
          console.error("添加本地贴纸失败:", error);
          setLoadingState(LoadingState.ERROR);
          Alert.alert("添加贴纸失败", "无法添加本地贴纸，请稍后再试。", [
            {
              text: "确定",
              onPress: () => {
                console.log("错误对话框确认，返回列表");
                setLoadingState(LoadingState.IDLE);
              },
            },
          ]);
        }
      },
      [addSticker, loadingState, setActiveCanvas]
    );

    const handleAddNetworkSticker = useCallback(
      async (sticker: StickerItem, index: number) => {
        if (loadingState !== LoadingState.IDLE) {
          console.log("加载状态中，忽略点击");
          return;
        }

        console.log("开始添加网络贴纸，索引:", index);
        setSelectedSticker(index);
        setLoadingState(LoadingState.LOADING);
        setLoadedSticker(sticker);

        try {
          console.log("调用 addSticker 方法");
          const layerId = await addSticker(sticker);
          console.log("添加贴纸成功，ID:", layerId);

          if (setActiveCanvas) {
            console.log("设置活动画布为新贴纸图层");
            setActiveCanvas(layerId);
          }

          // 显示成功状态
          console.log("设置加载状态为成功");
          setLoadingState(LoadingState.SUCCESS);
        } catch (error) {
          console.error("添加贴纸失败:", error);
          setLoadingState(LoadingState.ERROR);
          Alert.alert("添加贴纸失败", "请稍后再试或选择其他贴纸。", [
            {
              text: "确定",
              onPress: () => {
                console.log("错误对话框确认，返回列表");
                setLoadingState(LoadingState.IDLE);
              },
            },
          ]);
        }
      },
      [addSticker, loadingState, setActiveCanvas]
    );

    // 切换贴纸来源
    const toggleStickerSource = useCallback(() => {
      setUseLocalStickers(!useLocalStickers);
    }, [useLocalStickers]);

    // 记忆化渲染本地贴纸列表
    const localStickersList = useMemo(() => {
      return LOCAL_STICKERS.map((sticker, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.stickerItem,
            selectedSticker === index && styles.selectedStickerItem,
          ]}
          onPress={() => handleAddLocalSticker(sticker, index)}
          disabled={loadingState !== LoadingState.IDLE}
        >
          <Image
            source={sticker.source}
            style={styles.stickerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ));
    }, [handleAddLocalSticker, selectedSticker, loadingState]);

    // 记忆化渲染网络贴纸列表
    const networkStickersList = useMemo(() => {
      return NETWORK_STICKERS.map((sticker, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.stickerItem,
            selectedSticker === index && styles.selectedStickerItem,
          ]}
          onPress={() => handleAddNetworkSticker(sticker, index)}
          disabled={loadingState !== LoadingState.IDLE}
        >
          <Image
            source={{ uri: sticker.uri }}
            style={styles.stickerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ));
    }, [handleAddNetworkSticker, selectedSticker, loadingState]);

    // 渲染不同的内容基于加载状态
    const renderContent = () => {
      switch (loadingState) {
        case LoadingState.LOADING:
          return (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingIndicatorContainer}>
                <ActivityIndicator size="large" color={COLORS.accent} />
              </View>
              <Text style={styles.loadingText}>正在添加贴纸...</Text>
              <Text style={styles.loadingSubText}>
                {useLocalStickers
                  ? "本地贴纸加载速度更快"
                  : "网络贴纸可能需要几秒钟的时间"}
              </Text>
              {loadedSticker && (
                <View style={styles.previewContainer}>
                  <Image
                    source={
                      loadedSticker.isLocal
                        ? loadedSticker.source
                        : { uri: loadedSticker.uri }
                    }
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>
          );

        case LoadingState.SUCCESS:
          return (
            <View style={styles.loadingContainer}>
              <Icon name="checkmark-circle" size={60} color={COLORS.success} />
              <Text style={styles.successText}>贴纸添加成功!</Text>
              {loadedSticker && (
                <View style={styles.previewContainer}>
                  <Image
                    source={
                      loadedSticker.isLocal
                        ? loadedSticker.source
                        : { uri: loadedSticker.uri }
                    }
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>
          );

        case LoadingState.ERROR:
          return (
            <View style={styles.loadingContainer}>
              <Icon name="alert-circle" size={60} color={COLORS.error} />
              <Text style={styles.errorText}>贴纸添加失败</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => setLoadingState(LoadingState.IDLE)}
              >
                <Text style={styles.retryButtonText}>返回选择</Text>
              </TouchableOpacity>
            </View>
          );

        case LoadingState.IDLE:
        default:
          return (
            <View style={styles.contentContainer}>
              <View style={styles.sourceToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.sourceToggleButton,
                    useLocalStickers && styles.activeSourceButton,
                  ]}
                  onPress={() => setUseLocalStickers(true)}
                >
                  <Text
                    style={[
                      styles.sourceToggleText,
                      useLocalStickers && styles.activeSourceText,
                    ]}
                  >
                    本地贴纸
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sourceToggleButton,
                    !useLocalStickers && styles.activeSourceButton,
                  ]}
                  onPress={() => setUseLocalStickers(false)}
                >
                  <Text
                    style={[
                      styles.sourceToggleText,
                      !useLocalStickers && styles.activeSourceText,
                    ]}
                  >
                    网络贴纸
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.stickerGrid}
              >
                {useLocalStickers ? localStickersList : networkStickersList}
              </ScrollView>
            </View>
          );
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {loadingState === LoadingState.IDLE
              ? "贴纸"
              : loadingState === LoadingState.LOADING
              ? "正在添加贴纸"
              : loadingState === LoadingState.SUCCESS
              ? "添加成功"
              : "添加失败"}
          </Text>
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon
                name="close-outline"
                size={24}
                color={COLORS.text.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        {renderContent()}
      </View>
    );
  }
);

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
  closeButton: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  sourceToggleContainer: {
    flexDirection: "row",
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  sourceToggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: COLORS.canvasBackground,
  },
  activeSourceButton: {
    backgroundColor: COLORS.accent,
  },
  sourceToggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text.secondary,
  },
  activeSourceText: {
    color: "#fff",
  },
  scrollContainer: {
    flex: 1,
  },
  stickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 4,
  },
  stickerItem: {
    width: "25%", // 更小的贴纸，一行4个
    aspectRatio: 1,
    padding: 6,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 8,
  },
  selectedStickerItem: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + "10",
  },
  stickerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: COLORS.canvasBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIndicatorContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  successText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.success,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.error,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  previewContainer: {
    marginTop: 25,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(240, 240, 240, 0.8)",
    width: screenWidth * 0.3,
    height: screenWidth * 0.3,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewImage: {
    width: "90%",
    height: "90%",
    borderRadius: 8,
  },
});
