import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Dimensions
} from "react-native";
import { useTextStore } from "../../store/textStore";

// 可选颜色
const TEXT_COLORS = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF"
];

// 可选字体大小
const FONT_SIZES = [16, 20, 24, 32, 40, 48];

// 可选字体粗细
const FONT_WEIGHTS = [
  { id: "normal", label: "常规" },
  { id: "bold", label: "粗体" },
];

// 可选文本对齐方式
const TEXT_ALIGNS = [
  { id: "left", label: "左对齐" },
  { id: "center", label: "居中" },
  { id: "right", label: "右对齐" },
];

export const TextPanel = () => {
  const { 
    textItems, 
    selectedTextId, 
    addText, 
    updateTextStyle,
    updateText,
    removeText
  } = useTextStore();
  
  // 当前选中的文本项
  const selectedText = textItems.find(item => item.id === selectedTextId);
  
  // 新文本输入
  const [newTextInput, setNewTextInput] = useState("");
  
  // 添加新文本
  const handleAddText = () => {
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    
    const text = newTextInput.trim() || "点击编辑文本";
    addText(text, {
      x: windowWidth / 2 - 50,
      y: windowHeight / 2 - 20,
    });
    
    setNewTextInput("");
  };
  
  // 更新文本颜色
  const handleChangeColor = (color: string) => {
    if (selectedTextId) {
      updateTextStyle(selectedTextId, { color });
    }
  };
  
  // 更新字体大小
  const handleChangeFontSize = (fontSize: number) => {
    if (selectedTextId) {
      updateTextStyle(selectedTextId, { fontSize });
    }
  };
  
  // 更新字体粗细
  const handleChangeFontWeight = (fontWeight: string) => {
    if (selectedTextId) {
      updateTextStyle(selectedTextId, { fontWeight });
    }
  };
  
  // 更新文本对齐方式
  const handleChangeTextAlign = (textAlign: 'left' | 'center' | 'right') => {
    if (selectedTextId) {
      updateTextStyle(selectedTextId, { textAlign });
    }
  };
  
  // 删除选中的文本
  const handleDeleteText = () => {
    if (selectedTextId) {
      removeText(selectedTextId);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* 添加新文本 */}
      <View style={styles.addTextContainer}>
        <TextInput
          style={styles.textInput}
          value={newTextInput}
          onChangeText={setNewTextInput}
          placeholder="输入要添加的文本"
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddText}>
          <Text style={styles.addButtonText}>添加</Text>
        </TouchableOpacity>
      </View>
      
      {selectedTextId ? (
        <ScrollView>
          {/* 文本颜色选择器 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>文本颜色</Text>
            <View style={styles.colorPicker}>
              {TEXT_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedText?.style.color === color && styles.selectedOption
                  ]}
                  onPress={() => handleChangeColor(color)}
                />
              ))}
            </View>
          </View>
          
          {/* 字体大小选择器 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>字体大小</Text>
            <View style={styles.optionsList}>
              {FONT_SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.option,
                    selectedText?.style.fontSize === size && styles.selectedOption
                  ]}
                  onPress={() => handleChangeFontSize(size)}
                >
                  <Text style={styles.optionText}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* 字体粗细选择器 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>字体粗细</Text>
            <View style={styles.optionsList}>
              {FONT_WEIGHTS.map((weight) => (
                <TouchableOpacity
                  key={weight.id}
                  style={[
                    styles.option,
                    selectedText?.style.fontWeight === weight.id && styles.selectedOption
                  ]}
                  onPress={() => handleChangeFontWeight(weight.id)}
                >
                  <Text style={styles.optionText}>{weight.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* 文本对齐方式选择器 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>对齐方式</Text>
            <View style={styles.optionsList}>
              {TEXT_ALIGNS.map((align) => (
                <TouchableOpacity
                  key={align.id}
                  style={[
                    styles.option,
                    selectedText?.style.textAlign === align.id && styles.selectedOption
                  ]}
                  onPress={() => handleChangeTextAlign(align.id as any)}
                >
                  <Text style={styles.optionText}>{align.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* 删除按钮 */}
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteText}>
            <Text style={styles.deleteButtonText}>删除文本</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.noSelectionContainer}>
          <Text style={styles.noSelectionText}>请先添加文本或选择已有文本</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    height: 300,
  },
  addTextContainer: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#000",
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noSelectionText: {
    color: "#999",
  },
  section: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  optionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  option: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: "#000",
  },
  optionText: {
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
    margin: 15,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
}); 