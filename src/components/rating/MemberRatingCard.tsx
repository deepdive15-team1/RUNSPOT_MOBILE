import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "../common/button/Button";

import BadIcon from "@/src/assets/icon/rating/bad.svg";
import GoodIcon from "@/src/assets/icon/rating/good.svg";
import {
  borderRadius,
  colors,
  fontSizes,
  fontWeights,
  spacing,
} from "@/src/constants";
import { getGenderColor } from "@/src/constants/mappings";
import { JoinRequest } from "@/src/types/api/manageParticipants";
import { RatingType } from "@/src/types/api/rating";

interface MemberCardProps {
  member: JoinRequest;
  currentRating?: RatingType;
  onRate: (userId: number, rating: RatingType) => void;
}

function MemberRatingCardBase({
  member,
  currentRating,
  onRate,
}: MemberCardProps) {
  return (
    <View style={styles.cardContainer}>
      {/* 유저 프로필 및 매너 온도 영역 */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: getGenderColor(member.userGender) },
          ]}
        >
          <Text style={styles.avatarText}>{member.userName.charAt(0)}</Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{member.userName}</Text>
          <View style={styles.temperatureBadge}>
            {/* 현재는 디자인 유지를 위해 Mocking */}
            <Text style={styles.temperatureText}>매너온도 36.5°C</Text>
          </View>
        </View>
      </View>

      {/* 평가 버튼 영역 (아쉬워요 / 좋아요) */}
      <View style={styles.actionButtons}>
        <Button
          variant="outline"
          size="md"
          flex={1}
          isSelected={currentRating === "NEGATIVE"}
          onPress={() => onRate(member.userId, "NEGATIVE")}
          startIcon={
            <BadIcon
              width={20}
              height={20}
              color={
                currentRating === "NEGATIVE" ? colors.main : colors.gray200
              }
            />
          }
        >
          아쉬워요
        </Button>

        <Button
          variant="outline"
          size="md"
          flex={1}
          isSelected={currentRating === "POSITIVE"}
          onPress={() => onRate(member.userId, "POSITIVE")}
          startIcon={
            <GoodIcon
              width={20}
              height={20}
              color={
                currentRating === "POSITIVE" ? colors.main : colors.gray200
              }
            />
          }
        >
          좋아요
        </Button>
      </View>
    </View>
  );
}

export const MemberRatingCard = React.memo(MemberRatingCardBase);

const styles = StyleSheet.create({
  // Member Card
  cardContainer: {
    backgroundColor: colors.bg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.base,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  userInfo: {
    justifyContent: "center",
  },
  userName: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  temperatureBadge: {
    backgroundColor: colors.mainLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: "flex-start",
  },
  temperatureText: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
