import { View, Text, StyleSheet } from "react-native";

import { Button } from "../common/button/Button";

import { ParticipantProfile } from "./ParticipantProfile";

import AcceptSvg from "@/src/assets/icon/manage-Participants/accept.svg";
import RejectSvg from "@/src/assets/icon/manage-Participants/reject.svg";
import {
  borderRadius,
  colors,
  fontSizes,
  fontWeights,
  spacing,
} from "@/src/constants";
import { JoinRequest } from "@/src/types/api/manageParticipants";

interface RequestedParticipantCardProps {
  participant: JoinRequest;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}

export const RequestedParticipantCard = ({
  participant,
  onAccept,
  onReject,
}: RequestedParticipantCardProps) => {
  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <ParticipantProfile participant={participant} />
      </View>
      {/* Message */}
      {!!participant.messageToHost && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{participant.messageToHost}</Text>
        </View>
      )}

      {/* 거절 / 수락 버튼 */}
      <View style={styles.buttonRow}>
        <Button
          variant="outline"
          flex={1}
          rounded
          startIcon={<RejectSvg width={18} height={18} />}
          onPress={() => onReject(participant.id)}
          wrapperStyle={styles.rejectButton}
          textStyle={styles.rejectButtonText}
        >
          거절
        </Button>

        <Button
          variant="primary"
          flex={1}
          rounded
          startIcon={<AcceptSvg width={18} height={18} />}
          onPress={() => onAccept(participant.id)}
          wrapperStyle={styles.acceptButton}
          textStyle={styles.acceptButtonText}
        >
          수락
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.bg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: borderRadius.md,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.base,
  },

  messageBox: {
    backgroundColor: colors.bgSecondary,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  messageText: {
    fontSize: fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },

  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  rejectButton: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rejectButtonText: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
  },
  acceptButton: {
    backgroundColor: colors.main,
  },
  acceptButtonText: {
    color: colors.bg,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
  },
});
