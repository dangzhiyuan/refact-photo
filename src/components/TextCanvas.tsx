import React, { useEffect } from "react";
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useCanvasManager } from "../context/CanvasManagerContext";
import { useTextStore } from "../store/textStore";
import { TextItem } from "./TextItem";
import { useEditorStore } from "../store/editorStore";

export const TextCanvas = () => {
  const { registerCanvas } = useCanvasManager();
  const { 
    textItems, 
    selectedTextId, 
    editingTextId,
    selectText, 
    updateText,
    updateTextPosition,
    startEditingText,
    finishEditingText
  } = useTextStore();
  const { editorMode } = useEditorStore();
  
  // 注册Canvas
  useEffect(() => {
    registerCanvas("text", { type: "text" });
  }, [registerCanvas]);
  
  // 处理文本选择
  const handleSelectText = (id: string) => {
    selectText(id);
  };
  
  // 处理文本变化
  const handleTextChange = (id: string, text: string) => {
    updateText(id, text);
  };
  
  // 处理文本位置变化
  const handleTransformUpdate = (id: string, transform: any) => {
    updateTextPosition(id, transform);
  };
  
  // 开始编辑文本
  const handleStartEditing = (id: string) => {
    startEditingText(id);
  };
  
  // 结束编辑文本
  const handleFinishEditing = () => {
    finishEditingText();
  };
  
  // 点击空白区域时取消选择和编辑
  const handleCanvasPress = () => {
    selectText(null);
    finishEditingText();
    Keyboard.dismiss();
  };
  
  // 只有在文本编辑模式下才能交互
  const canInteract = editorMode === "text";
  
  return (
    <TouchableWithoutFeedback 
      onPress={handleCanvasPress}
      disabled={!canInteract}
    >
      <View style={[
        styles.container,
        { pointerEvents: canInteract ? "auto" : "none" }
      ]}>
        {textItems.map((item) => (
          <TextItem
            key={item.id}
            id={item.id}
            text={item.text}
            position={item.position}
            style={item.style}
            isSelected={selectedTextId === item.id}
            isEditing={editingTextId === item.id}
            onSelect={handleSelectText}
            onTextChange={handleTextChange}
            onTransformUpdate={handleTransformUpdate}
            onStartEditing={handleStartEditing}
            onFinishEditing={handleFinishEditing}
          />
        ))}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    // 确保文本Canvas在贴纸和绘图Canvas之上
    zIndex: 3,
  },
}); 