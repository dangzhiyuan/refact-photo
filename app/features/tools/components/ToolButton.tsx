import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

interface ToolButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  isActive?: boolean;
  label?: string;
}

export const ToolButton: React.FC<ToolButtonProps> = ({
  icon,
  onPress,
  isActive = false,
  label,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.toolButton,
        isActive && styles.activeToolButton,
      ]}
      onPress={onPress}
    >
      <MaterialIcons
        name={icon}
        size={24}
        color={isActive ? "#007AFF" : "#333"}
      />
      {label && (
        <Text
          style={[
            styles.toolLabel,
            isActive && styles.activeToolLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toolButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  activeToolButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  toolLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#333',
  },
  activeToolLabel: {
    color: '#007AFF',
  },
}); 