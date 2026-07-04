import { View, Text, StyleSheet } from "react-native";

import Chip from "../common/chip";

import { colors, fontSizes, fontWeights, spacing } from "@/src/constants";
import { GENDER_MAP, getGenderColor } from "@/src/constants/mappings";
import { JoinRequest } from "@/src/types/api/manageParticipants";

interface ParticipantProfileProps {
  participant: JoinRequest;
}

export const ParticipantProfile = ({
  participant,
}: ParticipantProfileProps) => {
  const displayGender =
    GENDER_MAP[participant.userGender] || participant.userGender;

  return (
    <View style={styles.profileSection}>
      {/* 좌측: 아바타 */}
      <View
        style={[
          styles.avatar,
          { backgroundColor: getGenderColor(participant.userGender) },
        ]}
      >
        <Text style={styles.avatarText}>{participant.userName.charAt(0)}</Text>
      </View>

      {/* 우측: 이름 및 성별 뱃지 */}
      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>{participant.userName}</Text>
        <Chip
          label={displayGender}
          size="small"
          color={participant.userGender === "MALE" ? "primary" : "red"}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
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
