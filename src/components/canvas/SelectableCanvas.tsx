import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useCanvasStore } from '../../store/canvasStore';

interface SelectableCanvasProps {
  canvasId: string;
  children: React.ReactNode;
  isActive: boolean;
  onSelect: (id: string) => void;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
}

/**
 * 可选择画布包装器组件
 * 为任何类型的画布添加点击选中功能
 */
export const SelectableCanvas: React.FC<SelectableCanvasProps> = ({
  canvasId,
  children,
  isActive,
  onSelect,
  pointerEvents = 'auto'
}) => {
  // 处理点击选中
  const handleSelect = () => {
    if (!isActive) {
      onSelect(canvasId);
    }
  };

  return (
    <View 
      style={styles.container} 
      onTouchStart={handleSelect}
      pointerEvents={pointerEvents}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
}); 