import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Button } from "../common/button/Button";

import { colors, fontSizes, fontWeights, spacing } from "@/src/constants";
import { getGenderColor } from "@/src/constants/mappings";
import { AttendanceMember, AttendanceStatus } from "@/src/types/api/attendance";

interface AttendanceMemberCardProps {
  participant: AttendanceMember;
  onToggleStatus: (
    participationId: number,
    currentStatus: AttendanceStatus,
  ) => void;
  isLastItem?: boolean;
}

const AttendanceMemberCard = ({
  participant,
  onToggleStatus,
  isLastItem = false,
}: AttendanceMemberCardProps) => {
  const isAttended = participant.attendanceStatus === "ATTENDED";

  return (
    <View style={[styles.container, !isLastItem && styles.bottomBorder]}>
      <View style={styles.profileSection}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: getGenderColor(participant.userGender) },
          ]}
        >
          <Text style={styles.avatarText}>
            {participant.userName.charAt(0)}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{participant.userName}</Text>
        </View>
      </View>

      <Button
        variant={isAttended ? "primary" : "outline"}
        size="sm"
        rounded={true}
        wrapperStyle={{ minWidth: 80 }}
        onPress={() =>
          onToggleStatus(participant.id, participant.attendanceStatus)
        }
      >
        {isAttended ? "출석" : "미출석"}
      </Button>
    </View>
  );
};

export default React.memo(AttendanceMemberCard, (prevProps, nextProps) => {
  return (
    prevProps.participant.attendanceStatus ===
      nextProps.participant.attendanceStatus &&
    prevProps.isLastItem === nextProps.isLastItem
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSecondary,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: spacing.xxxl,
    height: spacing.xxxl,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },

  infoContainer: {
    flexDirection: "column",
    justifyContent: "center",
    gap: spacing.xs,
  },
  nameText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
});
