import { memo } from "react";
import { Pressable, Text, StyleSheet, type ViewStyle } from "react-native";

import { colors, fontSizes } from "@/src/constants";

export interface SelectOptionItem<Value = string | number> {
  value: Value;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SelectOptionProps {
  value: string | number;
  children?: React.ReactNode;
  disabled?: boolean;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * 단일 옵션 행 (내부·필요 시 커스텀 목록용).
 * 일반적으로는 `Select`의 `options` 배열만 사용합니다.
 */
export const SelectOption = memo(function SelectOption({
  value: _value,
  children,
  disabled = false,
  selected = false,
  onPress,
  style,
}: SelectOptionProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowSelected,
        disabled && styles.rowDisabled,
        pressed && !disabled && styles.rowPressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          selected && styles.labelSelected,
          disabled && styles.labelDisabled,
        ]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </Pressable>
  );
});

SelectOption.displayName = "SelectOption";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  rowSelected: {
    backgroundColor: colors.gray100,
  },
  rowPressed: {
    backgroundColor: colors.gray100,
  },
  rowDisabled: {
    opacity: 0.6,
  },
  label: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: "400",
  },
  labelSelected: {
    fontWeight: "500",
  },
  labelDisabled: {
    color: colors.gray400,
  },
});

export default SelectOption;
