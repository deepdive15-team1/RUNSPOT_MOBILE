import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";

import { StackHeaderBack } from "./StackHeaderBack";

import { colors, fontSizes, fontWeights } from "@/src/constants";

/** Stack 기본 헤더: 좌측 `StackHeaderBack`, 가운데 제목은 화면별 `options.title` */
export const stackHeaderScreenOptions: NativeStackNavigationOptions = {
  headerShown: true,
  headerTitleAlign: "center",
  headerShadowVisible: true,
  headerStyle: {
    backgroundColor: colors.bg,
  },
  headerTitleStyle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.gray600,
  },
  headerBackVisible: false,
  headerLeft: () => <StackHeaderBack />,
};
