import { StyleSheet, ViewStyle, TextStyle, Platform } from "react-native";

import { theme } from "@/src/constants";

export type VariantType =
  | "primary"
  | "outline"
  | "outlinePrimary"
  | "neutral"
  | "text"
  | "textPrimary";

export type SizeType = "xs" | "sm" | "md" | "lg" | "xl";

export const wrapperVariants: Record<VariantType, ViewStyle> =
  StyleSheet.create({
    primary: {
      backgroundColor: theme.colors.main,
      borderColor: "transparent",
      borderWidth: 1,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: theme.colors.gray200,
      borderWidth: 1,
    },
    outlinePrimary: {
      backgroundColor: "transparent",
      borderColor: theme.colors.main,
      borderWidth: 1,
    },
    neutral: {
      backgroundColor: theme.colors.gray200,
      borderColor: "transparent",
      borderWidth: 1,
    },
    text: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      borderWidth: 1,
    },
    textPrimary: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      borderWidth: 1,
    },
  });

export const textVariants: Record<VariantType, TextStyle> = StyleSheet.create({
  primary: { color: theme.colors.white },
  outline: { color: theme.colors.text },
  outlinePrimary: { color: theme.colors.main },
  neutral: { color: theme.colors.text },
  text: { color: theme.colors.gray400 },
  textPrimary: { color: theme.colors.main },
});

export const wrapperSizes: Record<SizeType, ViewStyle> = StyleSheet.create({
  xs: { height: 36, paddingHorizontal: 10, borderRadius: 10 },
  sm: { height: 40, paddingHorizontal: 14, borderRadius: 10 },
  md: { height: 46, paddingHorizontal: 43, borderRadius: 14 },
  lg: { height: 56, paddingHorizontal: 16, borderRadius: 12 },
  xl: {
    height: 96,
    paddingHorizontal: 24,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});

export const wrapperText: Record<SizeType, TextStyle> = StyleSheet.create({
  xs: { fontSize: 12 },
  sm: { fontSize: 14 },
  md: { fontSize: 16 },
  lg: { fontSize: 18 },
  xl: { fontSize: 20 },
});

export const disabledWrapperVariants: Record<VariantType, ViewStyle> =
  StyleSheet.create({
    primary: {
      backgroundColor: theme.colors.gray300,
      borderColor: "transparent",
    },
    neutral: {
      backgroundColor: theme.colors.gray100,
      borderColor: "transparent",
    },

    outline: {
      backgroundColor: "transparent",
      borderColor: theme.colors.gray300,
    },
    outlinePrimary: {
      backgroundColor: "transparent",
      borderColor: theme.colors.gray300,
    },

    // 텍스트 버튼 (배경, 테두리 모두 투명하게 유지)
    text: { backgroundColor: "transparent", borderColor: "transparent" },
    textPrimary: { backgroundColor: "transparent", borderColor: "transparent" },
  });

export const buttonStyles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "flex-start", // 내용물 크기만큼만 차지하게 함
  },

  text: {
    fontWeight: "600",
    textAlign: "center",
    lineHeight: Platform.OS === "android" ? undefined : 0, // line-height 같은 효과
  },

  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  // 아이콘만 있는 버튼 (iconOnly={true} 일 때)
  iconOnly: {
    paddingHorizontal: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  // 완전히 둥근 버튼 (rounded={true} 일 때)
  rounded: {
    borderRadius: 9999,
  },

  // 선택된 상태 (isSelected={true} 일 때)
  selected: {
    borderWidth: 1,
    borderColor: theme.colors.main,
    backgroundColor: "transparent",
  },

  selectedText: {
    color: theme.colors.main,
    fontWeight: "700",
  },

  disabledText: {
    color: theme.colors.gray400,
  },
});
