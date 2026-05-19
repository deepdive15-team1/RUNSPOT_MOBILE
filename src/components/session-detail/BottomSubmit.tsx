import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";

import { joinSession } from "@/src/api/session-detail/sessionDetailApi.index";
import { Input } from "@/src/components/common/Input/Input";
import { Button } from "@/src/components/common/button/Button";
import { colors, spacing } from "@/src/constants";

interface BottomSubmitProps {
  sessionId: number;
}

export function BottomSubmit({ sessionId }: BottomSubmitProps) {
  const [message, setMessage] = useState("");

  const router = useRouter();

  const joinMutation = useMutation({
    mutationFn: (msg: string) => joinSession(sessionId, msg),
    onSuccess: () => {
      Alert.alert("신청 완료", "참여 신청이 성공적으로 완료되었습니다!", [
        {
          text: "확인",
          onPress: () => router.push("/(main)"),
        },
      ]);
    },
    // TODO: 추후 중복 신청 예외 처리 시 isAxiosError 도입 예정
    onError: (err) => {
      Alert.alert("신청에 실패했어요", "잠시 후 다시 시도해주세요.");
      console.warn("신청 실패: ", err);
    },
  });

  const handleApply = () => {
    joinMutation.mutate(message);
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="호스트에게 한마디 (선택)"
        value={message}
        onChangeText={setMessage}
        wrapperStyle={styles.inputWrapper}
      />

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onPress={handleApply}
        disabled={joinMutation.isPending}
      >
        {joinMutation.isPending ? "신청 중" : "참여 신청하기"}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
  },
  inputWrapper: {
    marginBottom: spacing.md,
  },
});
