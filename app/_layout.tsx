import { Stack } from "expo-router";

import { colors } from "@/src/constants";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          flex: 1,
          backgroundColor: colors.bgSecondary,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Home" }} />
    </Stack>
  );
}
