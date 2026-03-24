import { forwardRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewStyle,
  type GestureResponderEvent,
} from "react-native";

import { colors, borderRadius, spacing, fontSizes } from "@/src/constants";

export type ChipVariant = "filled" | "outlined";
export type ChipSize = "small" | "medium";
export type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning"
  | "green"
  | "yellow"
  | "red";

const VARIANTS = { filled: "filled", outlined: "outlined" } as const;

const SIZES: Record<ChipSize, { fontSize: number; height: number }> = {
  small: { fontSize: fontSizes.xs, height: 24 },
  medium: { fontSize: fontSizes.sm, height: 32 },
};

const LABEL_PADDING: Record<ChipSize, Record<ChipVariant, number>> = {
  small: { outlined: 7, filled: 8 },
  medium: { outlined: 11, filled: 12 },
};

/** Chip color prop별 색상 맵 (theme colors 기반) */
const chipColorMap = {
  default: {
    bg: colors.gray200,
    text: colors.gray600,
    border: colors.gray400,
    pressedBg: colors.gray400,
  },
  primary: {
    bg: colors.main,
    text: colors.white,
    border: colors.main,
    pressedBg: colors.mainPressed,
  },
  secondary: {
    bg: colors.secondaryBg,
    text: colors.main,
    border: colors.main,
    pressedBg: colors.secondaryPressed,
  },
  error: {
    bg: colors.error,
    text: colors.white,
    border: colors.error,
    pressedBg: colors.errorPressed,
  },
  info: {
    bg: colors.white,
    text: colors.gray600,
    border: colors.gray400,
    pressedBg: colors.infoPressed,
  },
  success: {
    bg: colors.success,
    text: colors.white,
    border: colors.success,
    pressedBg: colors.successPressed,
  },
  warning: {
    bg: colors.warning,
    text: colors.white,
    border: colors.warning,
    pressedBg: colors.warningPressed,
  },
  green: {
    bg: colors.green100,
    text: colors.green600,
    border: colors.green600,
    pressedBg: colors.greenPressed,
  },
  yellow: {
    bg: colors.yellow100,
    text: colors.yellow700,
    border: colors.yellow700,
    pressedBg: colors.yellowPressed,
  },
  red: {
    bg: colors.red100,
    text: colors.red600,
    border: colors.red600,
    pressedBg: colors.redPressed,
  },
} as const;

const colorMap = chipColorMap;

const DELETE_ICON_SIZES: Record<
  ChipSize,
  { marginRight: number; fontSize: number }
> = {
  small: { marginRight: spacing.xxs + 1, fontSize: 16 },
  medium: { marginRight: spacing.xs + 1, fontSize: 20 },
};

const ICON_WRAPPER_SIZES: Record<
  ChipSize,
  { marginLeft: number; marginRight: number; fontSize: number }
> = {
  small: { marginLeft: 7, marginRight: spacing.xs, fontSize: 16 },
  medium: { marginLeft: spacing.sm, marginRight: spacing.xs + 2, fontSize: 18 },
};

export interface ChipProps {
  label: React.ReactNode;
  variant?: ChipVariant;
  size?: ChipSize;
  color?: ChipColor;
  clickable?: boolean;
  disabled?: boolean;
  icon?: React.ReactElement;
  onDelete?: (event: GestureResponderEvent) => void;
  deleteIcon?: React.ReactElement;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

const DefaultDeleteIcon = ({ size }: { size: ChipSize }) => (
  <Text
    style={[
      styles.deleteIconText,
      { fontSize: DELETE_ICON_SIZES[size].fontSize },
    ]}
  >
    ×
  </Text>
);

const Chip = forwardRef<View, ChipProps>(function Chip(
  {
    label,
    variant = "filled",
    size = "medium",
    color = "default",
    clickable,
    disabled = false,
    icon,
    onDelete,
    deleteIcon,
    onPress,
    style,
    testID,
  },
  ref,
) {
  const isClickable = clickable ?? !!onPress;
  const isDeletable = !!onDelete;
  const c = colorMap[color];
  const sizeConfig = SIZES[size];

  const rootBg = variant === VARIANTS.filled ? c.bg : "transparent";
  const rootBorder =
    variant === VARIANTS.outlined
      ? { borderWidth: 1, borderColor: c.border }
      : {};
  const rootColor = variant === VARIANTS.filled ? c.text : c.border;

  const handleDeletePress = (e: GestureResponderEvent) => {
    onDelete?.(e);
  };

  const deleteIconElement = isDeletable ? (
    <Pressable
      onPress={handleDeletePress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.deleteIconWrapper,
        {
          marginRight: DELETE_ICON_SIZES[size].marginRight,
          opacity: pressed ? 1 : 0.8,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel="삭제"
    >
      {deleteIcon ?? <DefaultDeleteIcon size={size} />}
    </Pressable>
  ) : null;

  const iconElement = icon ? (
    <View
      style={[
        styles.iconWrapper,
        {
          marginLeft: ICON_WRAPPER_SIZES[size].marginLeft,
          marginRight: ICON_WRAPPER_SIZES[size].marginRight,
        },
      ]}
    >
      {icon}
    </View>
  ) : null;

  const labelPadding = LABEL_PADDING[size][variant];

  const labelContent =
    typeof label === "string" || typeof label === "number" ? (
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          {
            fontSize: sizeConfig.fontSize,
            paddingHorizontal: labelPadding,
            color: rootColor,
          },
        ]}
      >
        {label}
      </Text>
    ) : (
      <View style={[styles.labelWrap, { paddingHorizontal: labelPadding }]}>
        {label}
      </View>
    );

  const content = (
    <>
      {iconElement}
      {labelContent}
      {deleteIconElement}
    </>
  );

  const rootStyle: ViewStyle[] = [
    styles.root,
    {
      height: sizeConfig.height,
      backgroundColor: rootBg,
      opacity: disabled ? 0.6 : 1,
      ...rootBorder,
    },
  ];

  if (style) rootStyle.push(style);

  if (isClickable && !disabled && onPress) {
    return (
      <Pressable
        ref={ref as React.RefObject<View>}
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          ...rootStyle,
          pressed && { backgroundColor: c.pressedBg },
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        testID={testID}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View ref={ref} style={rootStyle} testID={testID}>
      {content}
    </View>
  );
});

Chip.displayName = "Chip";

export default Chip;

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    borderRadius: borderRadius.xl,
    maxWidth: "100%",
  },
  label: {
    overflow: "hidden",
  },
  labelWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  deleteIconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -6,
    padding: spacing.xxs,
    borderRadius: borderRadius.xl,
  },
  deleteIconText: {
    color: "inherit",
    fontWeight: "bold",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
});
