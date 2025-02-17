import "react-native-reanimated";
import React, { useEffect } from "react";
import { View, SafeAreaView, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CanvasView } from "./app/features/canvas";
import { Toolbar } from "./app/features/tools/Toolbar";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";

export default function App() {
  // 请求权限
  useEffect(() => {
    (async () => {
      // 请求 MediaLibrary 权限
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      if (mediaLibraryStatus.status !== "granted") {
        alert("需要相册权限来选择照片");
      }

      // 请求 ImagePicker 权限
      const imagePickerStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (imagePickerStatus.status !== "granted") {
        alert("需要相册权限来选择照片");
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <CanvasView />
          <Toolbar />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
