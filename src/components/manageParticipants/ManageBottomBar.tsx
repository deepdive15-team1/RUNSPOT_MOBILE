import { StyleSheet, View } from "react-native";

import { Button } from "../common/button/Button";

import { colors, fontSizes, fontWeights, spacing } from "@/src/constants";

interface ManageBottomBarProps {
  sessionId: number;
  onClose: (id: number) => void;
  onCheckStart: (id: number) => void;
}

export function ManageBottomBar({
  sessionId,
  onClose,
  onCheckStart,
}: ManageBottomBarProps) {
  return (
    <View style={styles.buttonRow}>
      <Button
        variant="neutral"
        flex={1}
        onPress={() => onClose(sessionId)}
        wrapperStyle={styles.rejectButton}
        textStyle={styles.rejectButtonText}
      >
        모집 마감
      </Button>

      <Button
        variant="primary"
        flex={1}
        onPress={() => onCheckStart(sessionId)}
        wrapperStyle={styles.acceptButton}
        textStyle={styles.acceptButtonText}
      >
        출석 체크 시작
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  rejectButton: {
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rejectButtonText: {
    color: colors.text,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
  },
  acceptButton: {
    backgroundColor: colors.main,
  },
  acceptButtonText: {
    color: colors.white,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
  },
});
