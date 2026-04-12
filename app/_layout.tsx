import { Stack } from "expo-router";

import { colors } from "@/src/constants";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          flex: 1,
          backgroundColor: colors.bgSecondary,
        },
      }}
    />
  );
}
