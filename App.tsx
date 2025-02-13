import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CanvasView } from "./app/features/canvas/CanvasView";
import { Toolbar } from "./app/features/tools/Toolbar";
import { View, SafeAreaView } from "react-native";
import { useEffect } from "react";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import { ErrorBoundary } from './app/components/ErrorBoundary';

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
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <CanvasView />
            <Toolbar />
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
