import React from "react";
import { EditorHome } from "./app/screens/EditorHome";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <EditorHome />
    </GestureHandlerRootView>
  );
}
