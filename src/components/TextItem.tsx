import React, { useState, useEffect, useRef } from "react";
import { 
  TextInput, 
  StyleSheet, 
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { TextItem as TextItemType } from "../store/textStore";

type TextItemProps = {
  id: string;
  text: string;
  position: TextItemType['position'];
  style: TextItemType['style'];
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (id: string) => void;
  onTextChange: (id: string, text: string) => void;
  onTransformUpdate: (id: string, transform: any) => void;
  onStartEditing: (id: string) => void;
  onFinishEditing: () => void;
};

export const TextItem = ({
  id,
  text,
  position,
  style: textStyle,
  isSelected,
  isEditing,
  onSelect,
  onTextChange,
  onTransformUpdate,
  onStartEditing,
  onFinishEditing
}: TextItemProps) => {
  const translateX = useSharedValue(position.x);
  const translateY = useSharedValue(position.y);
  const scale = useSharedValue(position.scale);
  const rotation = useSharedValue(position.rotation);
  const [inputText, setInputText] = useState(text);
  const inputRef = useRef<TextInput>(null);

  // 组件挂载或编辑状态改变时，聚焦输入框
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // 更新当前输入文本到 store
  const handleTextChange = (newText: string) => {
    setInputText(newText);
    onTextChange(id, newText);
  };

  // 失去焦点时结束编辑
  const handleBlur = () => {
    onFinishEditing();
  };

  // 更新位置信息到 store
  const updateTransform = () => {
    onTransformUpdate(id, {
      x: translateX.value,
      y: translateY.value,
      scale: scale.value,
      rotation: rotation.value
    });
  };

  // 手势处理
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value += event.translationX;
      translateY.value += event.translationY;
    })
    .onEnd(() => {
      runOnJS(updateTransform)();
    });

  const rotationGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value += event.rotation * 180 / Math.PI;
    })
    .onEnd(() => {
      runOnJS(updateTransform)();
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(0.5, Math.min(scale.value * event.scale, 3));
    })
    .onEnd(() => {
      runOnJS(updateTransform)();
    });

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      runOnJS(onSelect)(id);
      if (!isEditing) {
        runOnJS(onStartEditing)(id);
      }
    });

  // 组合手势
  const composedGesture = Gesture.Exclusive(
    tapGesture,
    Gesture.Simultaneous(
      panGesture, 
      Gesture.Simultaneous(pinchGesture, rotationGesture)
    )
  );

  // 动画样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      borderWidth: isSelected ? 1 : 0,
      borderColor: "#000",
      padding: isSelected ? 5 : 0,
    };
  });

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <TouchableWithoutFeedback onPress={() => {
          onSelect(id);
          if (!isEditing) {
            onStartEditing(id);
          }
        }}>
          <TextInput
            ref={inputRef}
            style={[
              styles.text,
              {
                color: textStyle.color,
                fontSize: textStyle.fontSize,
                fontFamily: textStyle.fontFamily,
                fontWeight: textStyle.fontWeight as any,
                textAlign: textStyle.textAlign,
              }
            ]}
            value={inputText}
            onChangeText={handleTextChange}
            editable={isEditing}
            multiline
            onBlur={handleBlur}
            autoFocus={isEditing}
            placeholder="点击编辑文本"
            placeholderTextColor="#999"
          />
        </TouchableWithoutFeedback>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    minWidth: 50,
    minHeight: 30,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  text: {
    padding: 5,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
}); 