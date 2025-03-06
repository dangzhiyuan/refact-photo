import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ImagePickerScreen } from "../screens/ImagePickerScreen";
import { Editor } from "../components/Editor";

export type RootStackParamList = {
  ImagePicker: undefined;
  Editor: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ImagePicker"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="ImagePicker" component={ImagePickerScreen} />
        <Stack.Screen
          name="Editor"
          component={Editor}
          options={{
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
