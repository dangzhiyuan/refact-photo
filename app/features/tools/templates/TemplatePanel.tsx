import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import { useTemplateStore } from "../../../store/templateStore";

// 简单的模板数据结构，不使用外部图片
const TEMPLATES = [
  {
    id: "t1",
    name: "日系风格1",
    description: "简约黑白配色，干净利落的版式",
    color: "#F3F3F3",
    textColor: "#000000",
  },
  {
    id: "t2",
    name: "复古风格",
    description: "复古褪色效果，怀旧风格",
    color: "#E8D0A9",
    textColor: "#6D4C41",
  },
  {
    id: "t3",
    name: "现代杂志",
    description: "大胆对比色，现代设计感",
    color: "#3F51B5",
    textColor: "#FFFFFF",
  },
  {
    id: "t4",
    name: "街头风格",
    description: "鲜明色彩，自由布局",
    color: "#FF5722",
    textColor: "#212121",
  },
];

export const TemplatePanel: React.FC = () => {
  const { applyTemplate } = useTemplateStore();

  const handleSelectTemplate = (templateId: string) => {
    console.log("选择模板:", templateId);
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      applyTemplate(template.id);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.templatesContainer}>
          {TEMPLATES.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[styles.templateItem, { backgroundColor: template.color }]}
              onPress={() => handleSelectTemplate(template.id)}
            >
              <Text
                style={[styles.templateName, { color: template.textColor }]}
              >
                {template.name}
              </Text>
              <Text
                style={[
                  styles.templateDescription,
                  { color: template.textColor },
                ]}
              >
                {template.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  templatesContainer: {
    flexDirection: "row",
  },
  templateItem: {
    width: 120,
    height: 160,
    marginRight: 16,
    borderRadius: 8,
    padding: 12,
    justifyContent: "space-between",
  },
  templateName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  templateDescription: {
    fontSize: 12,
    opacity: 0.8,
  },
});
