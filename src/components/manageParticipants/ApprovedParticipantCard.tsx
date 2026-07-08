import React from "react";
import { View, StyleSheet } from "react-native";

import { ParticipantProfile } from "./ParticipantProfile";

import { colors, spacing } from "@/src/constants";
import { JoinRequest } from "@/src/types/api/manageParticipants";

interface ApprovedParticipantCardProps {
  participant: JoinRequest;
  isLast: boolean;
}

export const ApprovedParticipantCard = ({
  participant,
  isLast,
}: ApprovedParticipantCardProps) => {
  return (
    <>
      <View style={styles.rowContainer}>
        <ParticipantProfile participant={participant} />
      </View>

      {/* 마지막 요소가 아닐 때만 하단 구분선 렌더링 */}
      {!isLast && <View style={styles.divider} />}
    </>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
});
