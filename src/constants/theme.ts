/**
 * 디자인 토큰 (MAP_FE variables.css 기반, RN 권장 구조)
 * StyleSheet에서 theme.colors.primary 형태로 사용
 */

import { Platform, type ViewStyle } from "react-native";

// ============ Colors ============
export const colors = {
  // Brand / Primary
  main: "#2B7FFF",
  mainPressed: "#1a5fcc",
  mainLight: "#EFF6FF",
  primary: "#2B7FFF", // main과 동일, 호환용

  // Semantic
  green: "#008236",
  greenLight: "#F0FDF4",
  green100: "#dcfce7",
  green600: "#16a34a",
  greenPressed: "#00b44b",
  yellow: "#A65F00",
  yellowLight: "#FEFCE8",
  yellow100: "#fef9c3",
  yellow700: "#ca8a04",
  yellowPressed: "#d97706",
  red: "#C10007",
  redLight: "#FEF2F2",
  red100: "#fee2e2",
  red600: "#dc2626",
  redPressed: "#ff4444",
  start: "#08FF1D",
  end: "#FF0808",

  // Semantic state (error, success, warning, info)
  error: "#dc2626",
  errorPressed: "#b91c1c",
  success: "#22c55e",
  successPressed: "#16a34a",
  warning: "#f59e0b",
  warningPressed: "#d97706",
  infoPressed: "#0284c7",

  // Secondary
  secondaryBg: "#e0e7ff",
  secondaryPressed: "#3d4a5c",

  // Gray scale
  gray100: "#F9FAFB",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#99A1AF",
  gray500: "#6B7280",
  gray600: "#4A5565",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",

  // Base
  white: "#FFFFFF",
  black: "#0A0A0A",

  // Text & Background (기본값)
  text: "#0A0A0A",
  textSecondary: "#4A5565",
  textMuted: "#99A1AF",
  bg: "#FFFFFF",
  bgSecondary: "#F9FAFB",

  // Border
  border: "#E5E7EB",
  borderLight: "#F9FAFB",
} as const;

export type ColorKey = keyof typeof colors;

// ============ Spacing (4px 기준 스케일) ============
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
} as const;

// ============ Typography ============
export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const fontWeights = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const lineHeights = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

// ============ Border Radius ============
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  base: 10,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// ============ Shadow / Elevation (플랫폼별 사용 시 참고) ============
export const elevation = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 16,
} as const;

/** iOS shadow 스타일 조각 */
export const shadowStyle = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

/** 웹: `shadow*` 대신 `boxShadow` (RN Web 콘솔 경고 방지). 네이티브는 기존 shadow* 유지. */
export function dropdownMenuShadow(): ViewStyle {
  if (Platform.OS === "web") {
    return {
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
    };
  }
  return { ...shadowStyle.lg };
}

/** TextField 에러 + 포커스 시 링 (웹은 boxShadow) */
export function textFieldErrorFocusShadow(): ViewStyle {
  if (Platform.OS === "web") {
    return {
      boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.1)",
    };
  }
  return {
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  };
}

/** Select 에러 테두리 강조 (웹은 boxShadow) */
export function selectErrorRingShadow(): ViewStyle {
  if (Platform.OS === "web") {
    return {
      boxShadow: "0 0 4px rgba(220, 38, 38, 0.2)",
    };
  }
  return {
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  };
}

// ============ Z-Index ============
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
} as const;

// ============ 통합 theme 객체 (한 번에 import 시) ============
export const theme = {
  colors,
  spacing,
  fontSizes,
  fontWeights,
  lineHeights,
  borderRadius,
  elevation,
  shadowStyle,
  zIndex,
} as const;

export default theme;
