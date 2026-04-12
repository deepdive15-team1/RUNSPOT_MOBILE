import { useRouter } from "expo-router";
import { Pressable } from "react-native";

import BackSvg from "@/src/assets/icon/back.svg";
import { colors } from "@/src/constants";

export function StackHeaderBack() {
  const router = useRouter();

  if (!router.canGoBack()) {
    return null;
  }

  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="뒤로 가기"
      style={{ marginLeft: 8, padding: 8 }}
    >
      <BackSvg width={18} height={18} color={colors.gray600} />
    </Pressable>
  );
}
