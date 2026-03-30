import React, { forwardRef } from "react";
import {
  View,
  Text,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";

import {
  SizeType,
  VariantType,
  buttonStyles,
  disabledWrapperVariants,
  textVariants,
  wrapperSizes,
  wrapperText,
  wrapperVariants,
} from "./Button.styles";

interface ButtonProps extends PressableProps {
  variant?: VariantType;
  size?: SizeType;
  fullWidth?: boolean;
  flex?: boolean | number;
  iconOnly?: boolean;
  rounded?: boolean;
  isSelected?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children?: React.ReactNode;

  wrapperStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button = forwardRef<View, ButtonProps>(
  (
    {
      variant = "primary",
      size = "lg",
      fullWidth = false,
      iconOnly = false,
      rounded = false,
      isSelected = false,
      disabled,
      startIcon,
      endIcon,
      wrapperStyle,
      textStyle,
      children,
      flex,
      ...props
    },
    ref,
  ) => {
    return (
      <Pressable
        ref={ref}
        disabled={disabled}
        {...props}
        style={({ pressed }) => [
          buttonStyles.wrapper,
          wrapperSizes[size],
          wrapperVariants[variant],
          fullWidth && { width: "100%", alignSelf: "auto" },

          flex
            ? { flex: typeof flex === "number" ? flex : 1, alignSelf: "auto" }
            : undefined,

          iconOnly && [
            buttonStyles.iconOnly,
            { width: wrapperSizes[size].height },
          ],

          rounded && buttonStyles.rounded,
          isSelected && buttonStyles.selected,

          pressed && { opacity: 0.8 },
          disabled && disabledWrapperVariants[variant],
          wrapperStyle,
        ]}
      >
        {startIcon && <View style={buttonStyles.iconWrapper}>{startIcon}</View>}

        {children &&
          (iconOnly ? (
            <View style={buttonStyles.iconWrapper}>{children}</View>
          ) : (
            <Text
              style={[
                buttonStyles.text,
                wrapperText[size],
                textVariants[variant],
                disabled && buttonStyles.disabledText,
                isSelected && buttonStyles.selectedText,
                textStyle,
              ]}
            >
              {children}
            </Text>
          ))}

        {endIcon && <View style={buttonStyles.iconWrapper}>{endIcon}</View>}
      </Pressable>
    );
  },
);

Button.displayName = "Button";
