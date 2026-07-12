import { AxiosError } from "axios";
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

import { signup } from "@/src/api/auth/authApi.index";
import {
  ConsentSection,
  type ConsentState,
} from "@/src/components/auth/ConsentSection";
import { Input } from "@/src/components/common/Input/Input";
import { Button } from "@/src/components/common/button/Button";
import { Select } from "@/src/components/common/select";
import { colors, fontSizes, fontWeights, spacing } from "@/src/constants";
import type { AgeGroup, Gender } from "@/src/types/api/auth";
import {
  areEqual,
  formatPaceDisplay,
  isEmpty,
  isInRange1To7,
  isValidPassword,
  paceStringToSeconds,
} from "@/src/utils";

const AGE_GROUP_OPTIONS = [
  { value: "10S", label: "10대" },
  { value: "20S", label: "20대" },
  { value: "30S", label: "30대" },
  { value: "40S", label: "40대" },
  { value: "50S", label: "50대" },
  { value: "60S", label: "60대 이상" },
];

const GENDER_OPTIONS = [
  { value: "MALE", label: "남성" },
  { value: "FEMALE", label: "여성" },
];

export default function SignupScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState<string | "">("");
  const [gender, setGender] = useState<string | "">("");
  const [weeklyRuns, setWeeklyRuns] = useState("");
  const [avgPaceMinPerKm, setAvgPaceMinPerKm] = useState("");
  const [consent, setConsent] = useState<ConsentState>({
    termsAgreed: false,
    privacyAgreed: false,
  });
  const [error, setError] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePaceChange = (value: string) => {
    setAvgPaceMinPerKm(formatPaceDisplay(value));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const next: Record<string, string> = {};

    if (isEmpty(username)) next.username = "아이디를 입력해주세요.";

    if (isEmpty(password)) {
      next.password = "비밀번호를 입력해주세요.";
    } else if (!isValidPassword(password, 8)) {
      next.password =
        "비밀번호는 영문, 숫자 포함 8자 이상이어야 합니다. (특수문자 가능)";
    }

    if (isEmpty(passwordConfirm)) {
      next.passwordConfirm = "비밀번호를 입력해주세요.";
    } else if (!isValidPassword(passwordConfirm, 8)) {
      next.passwordConfirm =
        "비밀번호는 영문, 숫자 포함 8자 이상이어야 합니다.";
    } else if (!areEqual(password, passwordConfirm)) {
      next.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }

    if (isEmpty(name)) next.name = "이름을 입력해주세요.";
    if (isEmpty(ageGroup)) next.ageGroup = "연령대를 선택해주세요.";
    if (isEmpty(gender)) next.gender = "성별을 선택해주세요.";

    if (isEmpty(weeklyRuns)) {
      next.weeklyRuns = "일주일 러닝 횟수를 입력해주세요.";
    } else if (!isInRange1To7(weeklyRuns)) {
      next.weeklyRuns = "1~7 사이 숫자를 입력해주세요.";
    }

    const paceSeconds = paceStringToSeconds(avgPaceMinPerKm.trim());
    if (isEmpty(avgPaceMinPerKm)) {
      next.avgPaceMinPerKm = "평균 페이스를 입력해주세요.";
    } else if (paceSeconds === null) {
      next.avgPaceMinPerKm = "mm:ss 형식으로 입력해주세요. (예: 05:30)";
    }

    if (!consent.termsAgreed || !consent.privacyAgreed) {
      next.consent =
        "필수 약관에 동의해 주세요. (이용약관, 개인정보 수집·이용)";
    }

    if (Object.keys(next).length > 0) {
      setError(next);
      return;
    }

    const requestBody = {
      username: username.trim(),
      password,
      name: name.trim(),
      ageGroup: ageGroup as AgeGroup,
      gender: gender as Gender,
      weeklyRuns: Number(weeklyRuns),
      avgPaceMinPerKm: paceSeconds!,
    };

    try {
      setIsSubmitting(true);
      setError({});
      await signup(requestBody);
      router.replace("/login");
    } catch (error) {
      const fallbackMessage = "회원가입에 실패했습니다.";
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        setError((prev) => ({
          ...prev,
          form:
            typeof serverMessage === "string" && serverMessage.trim().length > 0
              ? serverMessage
              : fallbackMessage,
        }));
        return;
      }

      setError((prev) => ({ ...prev, form: fallbackMessage }));
    } finally {
      setIsSubmitting(false);
    }
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
        <View style={styles.formWrap}>
          <Input
            label="아이디"
            placeholder="아이디를 입력해주세요"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            errorMessage={error.username}
          />

          <Input
            label="비밀번호"
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            errorMessage={error.password}
          />

          <Input
            label="비밀번호 확인(영문·숫자 포함 8자 이상)"
            placeholder="비밀번호를 입력해주세요"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            errorMessage={error.passwordConfirm}
          />

          <Input
            label="이름"
            placeholder="아이디와 비밀번호를 찾을 때 사용합니다."
            value={name}
            onChangeText={setName}
            autoCorrect={false}
            errorMessage={error.name}
          />

          <Select
            label="나이"
            placeholder="연령대를 선택해주세요"
            value={ageGroup}
            onChange={(event) => setAgeGroup(String(event.target.value))}
            options={AGE_GROUP_OPTIONS}
            error={!!error.ageGroup}
            helperText={error.ageGroup}
          />

          <Select
            label="성별"
            placeholder="성별을 선택해주세요"
            value={gender}
            onChange={(event) => setGender(String(event.target.value))}
            options={GENDER_OPTIONS}
            error={!!error.gender}
            helperText={error.gender}
          />

          <Input
            label="일주일 러닝 횟수"
            placeholder="숫자만 입력해주세요(1~7 사이 숫자)"
            value={weeklyRuns}
            onChangeText={setWeeklyRuns}
            keyboardType="number-pad"
            errorMessage={error.weeklyRuns}
          />

          <Input
            label="평균 페이스"
            placeholder="ex) 05:30"
            value={avgPaceMinPerKm}
            onChangeText={handlePaceChange}
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
            errorMessage={error.avgPaceMinPerKm}
          />

          <ConsentSection
            value={consent}
            onChange={(next) => {
              setConsent(next);
              if (error.consent) {
                setError((prev) => {
                  const nextErrors = { ...prev };
                  delete nextErrors.consent;
                  return nextErrors;
                });
              }
            }}
            errorMessage={error.consent}
          />

          {error.form ? (
            <Text style={styles.formError}>{error.form}</Text>
          ) : null}

          <View style={styles.submitWrap}>
            <Button
              variant="primary"
              size="md"
              fullWidth
              disabled={isSubmitting}
              onPress={handleSubmit}
            >
              {isSubmitting ? "가입 중..." : "가입"}
            </Button>
          </View>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>이미 계정이 있으신가요?</Text>
          <Pressable onPress={() => router.push("/login")}>
            <Text style={styles.loginLink}>로그인</Text>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
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
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  loginText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.gray600,
  },
  loginLink: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.main,
  },
});
