import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import {
  borderRadius,
  colors,
  fontSizes,
  lineHeights,
  spacing,
  textFieldErrorFocusShadow,
} from "@/src/constants";

export type TextFieldVariant = "primary" | "secondary";
export type TextFieldSize = "sm" | "md" | "lg";

const DEFAULTS = {
  variant: "primary" as TextFieldVariant,
  size: "md" as TextFieldSize,
  fullWidth: true,
  error: false,
  readOnly: false,
};

const LINE_HEIGHT = lineHeights.normal;

interface SizePreset {
  minHeight: number;
  paddingVertical: number;
  paddingHorizontal: number;
  fontSize: number;
}

const SIZES: Record<TextFieldSize, SizePreset> = {
  sm: {
    minHeight: 80,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: fontSizes.xs,
  },
  md: {
    minHeight: 100,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: fontSizes.sm,
  },
  lg: {
    minHeight: 120,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: fontSizes.base,
  },
};

function heightForRows(rows: number, preset: SizePreset): number {
  const line = preset.fontSize * LINE_HEIGHT;
  return Math.ceil(rows * line + preset.paddingVertical * 2);
}

export interface TextFieldProps extends Omit<
  TextInputProps,
  "style" | "readOnly"
> {
  /** RN `TextInput`에는 `disabled`가 없음 → `editable={false}`로 매핑 */
  disabled?: boolean;
  variant?: TextFieldVariant;
  size?: TextFieldSize;
  fullWidth?: boolean;
  error?: boolean;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  minRows?: number;
  maxRows?: number;
  rows?: number;
  inputProps?: TextInputProps;
  readOnly?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  function TextField(
    {
      label,
      error = DEFAULTS.error,
      helperText,
      variant = DEFAULTS.variant,
      size = DEFAULTS.size,
      fullWidth = DEFAULTS.fullWidth,
      minRows,
      maxRows,
      rows,
      containerStyle,
      inputStyle,
      inputProps,
      readOnly = DEFAULTS.readOnly,
      disabled = false,
      editable: editableProp,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) {
    const inputRef = useRef<TextInput>(null);
    useImperativeHandle(ref, () => inputRef.current as TextInput);

    const [focused, setFocused] = useState(false);
    const preset = SIZES[size];

    const rowCount = rows ?? minRows ?? 3;
    const minH = Math.max(preset.minHeight, heightForRows(rowCount, preset));
    const maxH = maxRows != null ? heightForRows(maxRows, preset) : undefined;

    const handleFocus = useCallback(
      (e: Parameters<NonNullable<TextInputProps["onFocus"]>>[0]) => {
        setFocused(true);
        inputProps?.onFocus?.(e);
        onFocus?.(e);
      },
      [onFocus, inputProps],
    );

    const handleBlur = useCallback(
      (e: Parameters<NonNullable<TextInputProps["onBlur"]>>[0]) => {
        setFocused(false);
        inputProps?.onBlur?.(e);
        onBlur?.(e);
      },
      [onBlur, inputProps],
    );

    const editable = readOnly || disabled ? false : (editableProp ?? true);

    const shellVariant =
      variant === "primary"
        ? { backgroundColor: colors.gray100, borderWidth: 0 as const }
        : {
            backgroundColor: colors.white,
            borderWidth: 1 as const,
            borderColor: colors.gray200,
          };

    const errorShell =
      error && focused
        ? {
            borderWidth: 1,
            borderColor: colors.error,
            ...textFieldErrorFocusShadow(),
          }
        : error
          ? { borderWidth: 1, borderColor: colors.error }
          : {};

    const disabledShell = disabled ? { backgroundColor: colors.gray100 } : {};

    return (
      <View
        style={[
          styles.wrap,
          fullWidth ? styles.wFull : styles.wAuto,
          containerStyle,
        ]}
      >
        {label != null && label !== "" && (
          <Text style={styles.label}>{label}</Text>
        )}

        <View
          style={[
            styles.shell,
            shellVariant,
            errorShell,
            {
              minHeight: minH,
              maxHeight: maxH,
              paddingVertical: preset.paddingVertical,
              paddingHorizontal: preset.paddingHorizontal,
            },
            disabledShell,
          ]}
        >
          <TextInput
            ref={inputRef}
            multiline
            scrollEnabled={maxRows != null}
            textAlignVertical="top"
            placeholderTextColor={colors.gray600}
            accessibilityState={{
              disabled: disabled || readOnly,
            }}
            {...inputProps}
            {...rest}
            editable={editable}
            style={[
              styles.input,
              {
                fontSize: preset.fontSize,
                lineHeight: preset.fontSize * LINE_HEIGHT,
                minHeight: minH - preset.paddingVertical * 2,
                maxHeight:
                  maxH != null ? maxH - preset.paddingVertical * 2 : undefined,
                color: disabled ? colors.gray400 : colors.text,
              },
              inputStyle,
              inputProps?.style,
            ]}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </View>

        {helperText != null && helperText !== "" && (
          <Text
            style={[styles.helper, error && { color: colors.error }]}
            accessibilityLiveRegion={error ? "polite" : undefined}
          >
            {helperText}
          </Text>
        )}
      </View>
    );
  },
);

TextField.displayName = "TextField";

export default TextField;

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  wFull: { width: "100%" },
  wAuto: { alignSelf: "flex-start" },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.text,
    width: "100%",
    textAlign: "left",
  },
  shell: {
    borderRadius: borderRadius.base,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    width: "100%",
    borderWidth: 0,
    backgroundColor: "transparent",
    padding: 0,
    margin: 0,
  },
  helper: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
