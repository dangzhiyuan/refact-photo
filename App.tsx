import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView, StatusBar } from "react-native";
import { AppNavigator } from "./src/navigation/Navigator";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" hidden />
      <SafeAreaView style={{ flex: 1 }}>
        <AppNavigator />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
