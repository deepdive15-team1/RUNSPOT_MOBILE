import { Stack } from "expo-router";

import { stackHeaderScreenOptions } from "@/src/components/header";

export default function MainLayout() {
  return (
    <Stack screenOptions={stackHeaderScreenOptions}>
      <Stack.Screen name="index" options={{ title: "홈" }} />
      {/** name에는 파일명, title에는 헤더에 표시할 제목목 */}
    </Stack>
  );
}
