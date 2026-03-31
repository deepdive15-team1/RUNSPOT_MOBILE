import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
} from "react";
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  Pressable,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";

import {
  VariantType,
  SizeType,
  inputStyles,
  wrapperVariants,
  inputSizes,
  wrapperSizes,
  focusedVariants,
  errorVariants,
} from "./Input.styles";

import { theme } from "@/src/constants";

interface InputProps extends TextInputProps {
  variant?: VariantType;
  size?: SizeType;
  fullWidth?: boolean;
  errorMessage?: string;
  label?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;

  //className 역할 - 부모에서 내려주는 스타일 속성 전달
  wrapperStyle?: StyleProp<ViewStyle>; // 1. 최상위 레이아웃용
  containerStyle?: StyleProp<ViewStyle>; // 2. 중간 박스 디자인 덮어쓰기용
  textStyle?: StyleProp<TextStyle>; // 3. 내부 텍스트 디자인 덮어쓰기용
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      errorMessage,
      editable = true, // true일 때 편집 가능, false일 때 편집 불가능(disabled)
      variant = "primary",
      size = "md",
      fullWidth = true,
      startIcon,
      endIcon,
      wrapperStyle,
      containerStyle,
      textStyle,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const innerRef = useRef<TextInput>(null);

    const [isFocused, setIsFocused] = useState(false);

    useImperativeHandle(ref, () => innerRef.current as TextInput);

    const handleContainerClick = () => {
      // 외부에서 ref를 안 줘도, 내부 innerRef로 포커스 가능
      innerRef.current?.focus();
    };

    const handleFocus: TextInputProps["onFocus"] = (e) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur: TextInputProps["onBlur"] = (e) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <View
        style={[
          inputStyles.wrapper,
          fullWidth ? { width: "100%" } : { width: "auto" },
          wrapperStyle,
        ]}
      >
        {label && <Text style={inputStyles.label}>{label}</Text>}

        <Pressable
          onPress={handleContainerClick}
          disabled={!editable}
          style={[
            inputStyles.inputContainer,
            wrapperSizes[size], // 박스 사이즈
            wrapperVariants[variant], // 박스 배경, 테두리색
            isFocused && !errorMessage ? focusedVariants[variant] : null,
            errorMessage ? errorVariants[variant] : null, // 에러 시 빨간 테두리
            !editable ? inputStyles.disabledContainer : null, // 비활성화 시 배경색
            containerStyle,
          ]}
        >
          {startIcon && (
            <View style={inputStyles.iconWrapper}>{startIcon}</View>
          )}

          <TextInput
            ref={innerRef}
            style={[inputStyles.input, inputSizes[size], textStyle]}
            editable={editable}
            placeholderTextColor={theme.colors.gray400}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {endIcon && <View style={inputStyles.iconWrapper}>{endIcon}</View>}
        </Pressable>

        {errorMessage && (
          <Text style={inputStyles.errorMessage}>{errorMessage}</Text>
        )}
      </View>
    );
  },
);

Input.displayName = "Input";
