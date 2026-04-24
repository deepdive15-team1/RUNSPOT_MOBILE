import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import LockIcon from "@/src/assets/icon/auth/lock.svg";
import LogoIcon from "@/src/assets/icon/brand/logo.svg";
import AvatarIcon from "@/src/assets/icon/common/avatar.svg";
import { Input } from "@/src/components/common/Input/Input";
import { Button } from "@/src/components/common/button/Button";
import { colors, fontSizes, fontWeights, spacing } from "@/src/constants";
import { isEmpty } from "@/src/utils";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const next: Record<string, string> = {};

    if (isEmpty(username)) next.username = "아이디를 입력해주세요.";
    if (isEmpty(password)) next.password = "비밀번호를 입력해주세요.";

    setError(next);

    // TODO: 로그인 API 연동 예정
    if (Object.keys(next).length > 0) return;
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrap}>
          <LogoIcon width={150} height={150} />
        </View>

        <View style={styles.formWrap}>
          <Input
            label="아이디"
            placeholder="아이디를 입력해주세요"
            startIcon={<AvatarIcon width={20} height={20} />}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            errorMessage={error.username}
          />

          <Input
            label="비밀번호"
            placeholder="비밀번호를 입력해주세요"
            startIcon={<LockIcon width={20} height={20} />}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            errorMessage={error.password}
          />

          {error.form ? (
            <Text style={styles.formError}>{error.form}</Text>
          ) : null}

          <View style={styles.submitWrap}>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onPress={handleSubmit}
            >
              로그인
            </Button>
          </View>
        </View>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>계정이 없으신가요?</Text>
          <Pressable onPress={() => router.push("/signup")}>
            <Text style={styles.signupLink}>계정 만들기</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  logoWrap: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: 40,
    fontWeight: fontWeights.bold,
    color: colors.main,
  },
  formWrap: {
    width: "100%",
    maxWidth: 360,
    gap: spacing.base,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.md,
  },
  submitWrap: {
    width: "100%",
    marginTop: spacing.md,
  },
  formError: {
    width: "100%",
    fontSize: fontSizes.sm,
    color: colors.error,
  },
  signupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  signupText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.gray600,
  },
  signupLink: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.main,
  },
});
