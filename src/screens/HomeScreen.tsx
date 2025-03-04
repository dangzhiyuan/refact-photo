import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useEditorStore } from "../store/editorStore";

export const HomeScreen = () => {
  const navigation = useNavigation();
  const setPhoto = useEditorStore(state => state.setPhoto);
  
  // 从相册选择照片
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
      navigation.navigate("Editor" as never);
    }
  };
  
  return (
    <View style={styles.container}>
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
          <Text style={styles.buttonText}>从相册选择照片</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Text>最近</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text>相册</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text>拍照</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text>更多</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  pickButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
  },
  buttonText: {
    fontSize: 16,
  },
  tabBar: {
    flexDirection: "row",
    top:"10%",
    height: 50,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
}); 