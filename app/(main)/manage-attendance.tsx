import { StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, fontWeights, spacing } from "@/src/constants";

export default function ManageAttendanceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>참여자 관리</Text>
      <Text style={styles.hint}>
        `/manage-attendance`에 대응하는 화면입니다. (준비 중)
      </Text>
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
