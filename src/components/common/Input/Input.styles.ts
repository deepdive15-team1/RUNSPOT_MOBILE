import { StyleSheet, ViewStyle, TextStyle, Platform } from "react-native";

import { theme, textFieldErrorFocusShadow } from "@/src/constants";

// 타입을 먼저 정의하여 분기 스타일의 기준 설정
export type SizeType = "sm" | "md" | "lg";
export type VariantType = "primary" | "neutral" | "underline";

// View(박스)에 줄 스타일
export const wrapperVariants: Record<VariantType, ViewStyle> =
  StyleSheet.create({
    primary: {
      backgroundColor: theme.colors.bg,
      borderColor: theme.colors.border,
      borderWidth: 1,
    },
    neutral: {
      backgroundColor: theme.colors.gray100,
      borderColor: theme.colors.gray200,
      borderWidth: 1,
    },
    underline: {
      backgroundColor: "transparent",
      borderBottomColor: theme.colors.border, // 아래쪽 테두리 색상
      borderBottomWidth: 1, // 아래쪽 테두리 두께만 1로
      borderRadius: 0, // 기본 컨테이너의 둥근 모서리 제거
      paddingHorizontal: 0,
    },
  });

// 네이티브는 View에 text와 관련된 스타일 사용 불가 따로 만들어서 적용해야 함
export const wrapperSizes: Record<SizeType, ViewStyle> = StyleSheet.create({
  sm: { height: 40, paddingHorizontal: theme.spacing.md },
  md: { height: 44, paddingHorizontal: 14 },
  lg: { height: 52, paddingHorizontal: theme.spacing.base },
});

export const inputSizes: Record<SizeType, TextStyle> = StyleSheet.create({
  sm: { fontSize: theme.fontSizes.xs },
  md: { fontSize: theme.fontSizes.sm },
  lg: { fontSize: theme.fontSizes.base },
});

export const focusedVariants: Record<VariantType, ViewStyle> =
  StyleSheet.create({
    primary: {
      borderColor: theme.colors.main,
      borderWidth: 2,
    },
    neutral: {
      borderColor: theme.colors.main,
      borderWidth: 2,
    },
    underline: {
      borderBottomColor: theme.colors.main,
      borderBottomWidth: 2,
    },
  });

export const errorVariants: Record<VariantType, ViewStyle> = StyleSheet.create({
  primary: {
    borderColor: theme.colors.error,
    borderWidth: 1,
    ...textFieldErrorFocusShadow(),
  },
  neutral: {
    borderColor: theme.colors.error,
    borderWidth: 1,
    ...textFieldErrorFocusShadow(),
  },
  underline: {
    borderBottomColor: theme.colors.error, // 아래쪽만 에러 색상
    borderBottomWidth: 1,
  },
});

export const inputStyles = StyleSheet.create({
  wrapper: {
    flexDirection: "column",
    gap: 6,
  },

  label: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    width: "100%",
    color: theme.colors.text,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderRadius: theme.borderRadius.base,
  },

  input: {
    flex: 1,
    backgroundColor: "transparent",
    color: theme.colors.text,
    ...Platform.select({
      android: {
        paddingVertical: 0,
      },
    }),
  },

  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },

  errorMessage: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },

  disabledContainer: {
    backgroundColor: theme.colors.gray100,
  },
});
