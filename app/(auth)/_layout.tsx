import { Stack } from "expo-router";

import { stackHeaderScreenOptions } from "@/src/components/header";

export default function AuthLayout() {
  return (
    <Stack screenOptions={stackHeaderScreenOptions}>
      <Stack.Screen name="login" options={{ title: "로그인" }} />
      <Stack.Screen name="signup" options={{ title: "회원가입" }} />
      <Stack.Screen name="terms" options={{ title: "이용약관" }} />
      <Stack.Screen name="privacy" options={{ title: "개인정보 처리방침" }} />
    </Stack>
  );
}
