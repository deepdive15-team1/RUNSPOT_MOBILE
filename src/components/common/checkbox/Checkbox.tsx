import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import {
  borderRadius,
  colors,
  fontSizes,
  fontWeights,
  spacing,
} from "@/src/constants";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  endAdornment?: React.ReactNode;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  error = false,
  accessibilityLabel,
  style,
  endAdornment,
}: CheckboxProps) {
  return (
    <View style={[styles.row, style]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        onPress={() => onChange(!checked)}
        style={styles.pressable}
        hitSlop={8}
      >
        <View
          style={[
            styles.box,
            checked && styles.boxChecked,
            error && !checked && styles.boxError,
            disabled && styles.boxDisabled,
          ]}
        >
          {checked ? (
            <Ionicons name="checkmark" size={14} color={colors.white} />
          ) : null}
        </View>
        <View style={styles.labelWrap}>
          {typeof label === "string" ? (
            <Text style={styles.label}>{label}</Text>
          ) : (
            label
          )}
        </View>
      </Pressable>
      {endAdornment}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  pressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  box: {
    width: 20,
    height: 20,
    marginTop: 1,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: {
    borderColor: colors.main,
    backgroundColor: colors.main,
  },
  boxError: {
    borderColor: colors.error,
  },
  boxDisabled: {
    opacity: 0.5,
  },
  labelWrap: {
    flex: 1,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.gray800,
    lineHeight: 20,
  },
});
