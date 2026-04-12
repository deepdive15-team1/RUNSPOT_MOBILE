import { Stack } from "expo-router";

import { stackHeaderScreenOptions } from "@/src/components/header";

export default function AuthLayout() {
  return (
    <Stack screenOptions={stackHeaderScreenOptions}>
      <Stack.Screen name="login" options={{ title: "로그인" }} />
      <Stack.Screen name="signup" options={{ title: "회원가입" }} />
    </Stack>
  );
}
