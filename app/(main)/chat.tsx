import { StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, fontWeights, spacing } from "@/src/constants";

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>채팅</Text>
      <Text style={styles.hint}>`/chat`에 대응하는 화면입니다. (준비 중)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.bgSecondary,
    justifyContent: "center",
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
});
