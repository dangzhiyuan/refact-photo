import { GestureHandlerRootView } from "react-native-gesture-handler";
import { EditorHome } from "./features/EditorHome"; // 实际入口组件

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <EditorHome />
    </GestureHandlerRootView>
  );
}
