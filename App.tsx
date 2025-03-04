import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

// 屏幕
import { HomeScreen } from "./src/screens/HomeScreen";
import { EditorScreen } from "./src/screens/EditorScreen";

// 全局状态管理器提供者
import { CanvasManagerProvider } from "./src/context/CanvasManagerContext";

// 创建导航堆栈
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" hidden/>
        <CanvasManagerProvider>
          <NavigationContainer>
            <Stack.Navigator 
              initialRouteName="Home"
              screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Editor" component={EditorScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </CanvasManagerProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
