import React, { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";

import { colors, fontSizes, fontWeights, spacing } from "@/src/constants";
import { getGenderColor } from "@/src/constants/mappings";
import { AttendanceMember } from "@/src/types/api/attendance";

interface ParticipantCardProps {
  participant: AttendanceMember;
  isLastItem?: boolean;
  rightAction?: ReactNode;
}

function ParticipantCard({
  participant,
  isLastItem = false,
  rightAction,
}: ParticipantCardProps) {
  return (
    <View style={[styles.container, !isLastItem && styles.bottomBorder]}>
      {/* 좌측: 아바타 및 유저 정보 */}
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

      {/* 우측: 주입받은 액션 컴포넌트 (버튼 등) */}
      {rightAction && <View style={styles.actionContainer}>{rightAction}</View>}
    </View>
  );
}

export default React.memo(ParticipantCard);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg,
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  //  Profile Section (Left)
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
  },
  infoContainer: {
    justifyContent: "center",
  },
  nameText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },

  //  Action Section (Right)
  actionContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    minWidth: 80,
  },
});
