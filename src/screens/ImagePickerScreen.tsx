import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEditorStore } from "../store/editorStore";
import { useCanvasStore } from "../store/canvasStore";
import { Ionicons } from "@expo/vector-icons";
import { useImageManager } from "../hooks/useImageManager";

interface ImagePickerScreenProps {
  navigation: any;
}

export const ImagePickerScreen: React.FC<ImagePickerScreenProps> = ({
  navigation,
}) => {
  const { baseImageUri, setBaseImageUri } = useEditorStore();
  const { isLoading, error, clearError, pickImage } = useImageManager();

  const handleSelectImage = async () => {
    const result = await pickImage();

    if (result && result.uri) {
      setBaseImageUri(result.uri);
    }
    if (error) {
      if (error.code !== "PICKER_CANCELLED") {
        Alert.alert("错误", error.message);
      }
      clearError();
    }
  };

  const handleStartEditing = () => {
    if (baseImageUri) {
      // 进入编辑页面前，重置所有图层数据，确保是全新的编辑状态
      const { resetLayers } = useCanvasStore.getState();
      resetLayers();
      
      navigation.navigate("Editor");
    } else {
      Alert.alert("提示", "请先选择一张图片");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>选择图片</Text>
      </View>

      <View style={styles.imageContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#3478F6" />
        ) : baseImageUri ? (
          <Image source={{ uri: baseImageUri }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={80} color="#555" />
            <Text style={styles.placeholderText}>暂无选择图片</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={handleSelectImage}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>从相册选择</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.editButton, !baseImageUri && styles.disabledButton]}
          onPress={handleStartEditing}
          disabled={!baseImageUri || isLoading}
        >
          <Text style={styles.buttonText}>开始编辑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    color: "#FFF",
    fontWeight: "bold",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
  },
  preview: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    resizeMode: "contain",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#333",
    borderStyle: "dashed",
    borderRadius: 12,
    width: "100%",
    height: "100%",
  },
  placeholderText: {
    color: "#777",
    marginTop: 12,
    fontSize: 16,
  },
  buttonsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  selectButton: {
    backgroundColor: "#3478F6",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: "#22A45D",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#555",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
