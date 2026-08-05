import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAttendance } from "@/src/api/attendance/attendanceApi.index";
import { rateMembers } from "@/src/api/rating/ratingApi.index";
import { Button } from "@/src/components/common/button/Button";
import { MemberRatingCard } from "@/src/components/rating/MemberRatingCard";
import { colors, spacing, fontSizes, fontWeights } from "@/src/constants";
import { attendanceKey, myPageKeys } from "@/src/constants/queryKeys";
import { JoinRequest } from "@/src/types/api/manageParticipants";
import { RatingType } from "@/src/types/api/rating";

export default function MemberRatingScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  const queryClient = useQueryClient();

  const [ratingsMap, setRatingsMap] = useState<Record<number, RatingType>>({});

  const {
    data: members = [],
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: attendanceKey.all(Number(sessionId)),
    queryFn: () => getAttendance(Number(sessionId)),
    select: (allMembers: JoinRequest[]) => {
      return allMembers.filter(
        (member) => member.attendanceStatus === "ATTENDED",
      );
    },
    enabled: !!sessionId,
  });

  const { mutate: submitRatings, isPending: isSubmitting } = useMutation({
    mutationFn: (
      payloadRatings: { targetUserId: number; rating: RatingType }[],
    ) => rateMembers(Number(sessionId), { ratings: payloadRatings }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myPageKeys.createdRuns() });
      router.back();
    },
    onError: (error) => {
      console.error("멤버 평가 실패:", error);
    },
  });

  const handleRate = useCallback((userId: number, rating: RatingType) => {
    setRatingsMap((prev) => ({
      ...prev,
      [userId]: rating,
    }));
  }, []);

  const isAllEvaluated = useMemo(() => {
    return (
      members.length > 0 && Object.keys(ratingsMap).length === members.length
    );
  }, [ratingsMap, members.length]);

  const handleSubmit = () => {
    if (!isAllEvaluated || isSubmitting) return;

    const payloadRatings = Object.entries(ratingsMap).map(
      ([targetUserId, rating]) => ({
        targetUserId: Number(targetUserId),
        rating,
      }),
    );

    submitRatings(payloadRatings);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>참석자 목록을 불러오지 못했습니다.</Text>
        <Button
          variant="outline"
          size="sm"
          onPress={() => refetch()}
          wrapperStyle={{ marginTop: spacing.md }}
        >
          다시 시도
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>오늘 러닝은 어떠셨나요?</Text>
          <Text style={styles.subTitle}>
            오늘 함께 뛴 멤버들의 매너를 평가해주세요.{"\n"}
            여러분의 평가는 더 좋은 러닝 문화를 만듭니다.
          </Text>
        </View>

        <View style={styles.listSection}>
          {members.length === 0 ? (
            <Text style={styles.emptyText}>평가할 참석자가 없습니다.</Text>
          ) : (
            members.map((member) => (
              <MemberRatingCard
                key={member.userId}
                member={member}
                currentRating={ratingsMap[member.userId]}
                onRate={handleRate}
              />
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomArea}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isAllEvaluated || isSubmitting || members.length === 0}
          onPress={handleSubmit}
        >
          {isSubmitting ? "제출 중..." : "평가 제출하기"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Layout & Container
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },

  // State UI (로딩, 에러, 빈 화면 상태)
  centerContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  centerBox: {
    alignItems: "center",
  },
  errorText: {
    color: colors.error,
  },
  emptyText: {
    textAlign: "center",
    color: colors.gray500,
    marginTop: spacing.xl,
    fontSize: fontSizes.base,
  },

  // Title Section (상단 안내 문구 영역)
  titleSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: "center",
    backgroundColor: colors.bg,
  },
  mainTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subTitle: {
    fontSize: fontSizes.sm,
    color: colors.gray600,
    textAlign: "center",
    lineHeight: 20,
  },

  // List Section (멤버 평가 카드 리스트 영역)
  listSection: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  // Bottom Area (하단 고정 버튼 영역)
  bottomArea: {
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
