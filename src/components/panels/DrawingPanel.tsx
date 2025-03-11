import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useDrawingStore } from "../../store/drawingStore";
import { BrushType } from "../../core/types/canvas";
import { Icon } from "../common/Icon";
import { COLORS } from "../../theme/colors";
import Slider from "@react-native-community/slider";

interface DrawingPanelProps {
  onClose?: () => void;
}

const BRUSH_TYPES = [
  { type: BrushType.NORMAL, icon: "brush", label: "画笔" },
  { type: BrushType.SOFT, icon: "brush-outline", label: "柔和" },
  { type: BrushType.NEON, icon: "flash", label: "霓虹" },
  { type: BrushType.MOSAIC, icon: "grid", label: "马赛克" },
  { type: BrushType.BLUR, icon: "water", label: "模糊" },
  { type: BrushType.ERASER, icon: "trash", label: "橡皮" },
];

const DEFAULT_COLORS = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
];

export const DrawingPanel: React.FC<DrawingPanelProps> = ({ onClose }) => {
  const {
    currentBrush,
    recentColors,
    setBrushType,
    setBrushColor,
    setBrushWidth,
    setBrushOpacity,
    setBrushSettings,
    undo,
    redo,
    clear,
  } = useDrawingStore();

  const handleBrushTypePress = (type: BrushType) => {
    setBrushType(type);
  };

  const handleColorPress = (color: string) => {
    setBrushColor(color);
  };

  const renderBrushTypeButtons = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.brushTypesContainer}
    >
      {BRUSH_TYPES.map((brush) => (
        <TouchableOpacity
          key={brush.type}
          style={[
            styles.brushTypeButton,
            currentBrush.type === brush.type && styles.activeBrushTypeButton,
          ]}
          onPress={() => handleBrushTypePress(brush.type)}
        >
          <Icon
            name={brush.icon}
            size={24}
            color={
              currentBrush.type === brush.type
                ? COLORS.accent
                : COLORS.text.secondary
            }
          />
          <Text
            style={[
              styles.brushTypeLabel,
              currentBrush.type === brush.type && styles.activeBrushTypeLabel,
            ]}
          >
            {brush.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderColorPicker = () => (
    <View style={styles.colorPickerContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[...recentColors, ...DEFAULT_COLORS].map((color, index) => (
          <TouchableOpacity
            key={`${color}-${index}`}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              currentBrush.color === color && styles.activeColorButton,
            ]}
            onPress={() => handleColorPress(color)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderBrushSettings = () => {
    const settings = currentBrush.settings || {};

    return (
      <View style={styles.brushSettingsContainer}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>大小</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={50}
            value={currentBrush.strokeWidth}
            onValueChange={setBrushWidth}
            minimumTrackTintColor={COLORS.accent}
            maximumTrackTintColor={COLORS.text.secondary}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>不透明度</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={currentBrush.opacity}
            onValueChange={setBrushOpacity}
            minimumTrackTintColor={COLORS.accent}
            maximumTrackTintColor={COLORS.text.secondary}
          />
        </View>

        {currentBrush.type === BrushType.SOFT && (
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>柔和度</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={settings.softness || 0.5}
              onValueChange={(value) => setBrushSettings({ softness: value })}
              minimumTrackTintColor={COLORS.accent}
              maximumTrackTintColor={COLORS.text.secondary}
            />
          </View>
        )}

        {currentBrush.type === BrushType.NEON && (
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>发光强度</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={settings.glowIntensity || 0.7}
              onValueChange={(value) =>
                setBrushSettings({ glowIntensity: value })
              }
              minimumTrackTintColor={COLORS.accent}
              maximumTrackTintColor={COLORS.text.secondary}
            />
          </View>
        )}

        {currentBrush.type === BrushType.MOSAIC && (
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>马赛克大小</Text>
            <Slider
              style={styles.slider}
              minimumValue={5}
              maximumValue={50}
              value={settings.mosaicSize || 10}
              onValueChange={(value) =>
                setBrushSettings({ mosaicSize: Math.round(value) })
              }
              minimumTrackTintColor={COLORS.accent}
              maximumTrackTintColor={COLORS.text.secondary}
            />
          </View>
        )}

        {currentBrush.type === BrushType.BLUR && (
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>模糊半径</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={25}
              value={settings.blurRadius || 10}
              onValueChange={(value) =>
                setBrushSettings({ blurRadius: Math.round(value) })
              }
              minimumTrackTintColor={COLORS.accent}
              maximumTrackTintColor={COLORS.text.secondary}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={undo}>
          <Icon name="arrow-undo" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={redo}>
          <Icon name="arrow-redo" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        <TouchableOpacity style={styles.headerButton} onPress={clear}>
          <Icon name="trash-outline" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={onClose}>
          <Icon name="close" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {renderBrushTypeButtons()}
      {currentBrush.type !== BrushType.ERASER && renderColorPicker()}
      {renderBrushSettings()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.panelBackground,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerButton: {
    padding: 10,
  },
  headerSpacer: {
    flex: 1,
  },
  brushTypesContainer: {
    paddingVertical: 10,
  },
  brushTypeButton: {
    alignItems: "center",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  activeBrushTypeButton: {
    backgroundColor: COLORS.accent + "15",
  },
  brushTypeLabel: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  activeBrushTypeLabel: {
    color: COLORS.accent,
  },
  colorPickerContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  activeColorButton: {
    borderColor: COLORS.accent,
  },
  brushSettingsContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  settingLabel: {
    width: 80,
    color: COLORS.text.primary,
    fontSize: 14,
  },
  slider: {
    flex: 1,
    height: 40,
  },
});
