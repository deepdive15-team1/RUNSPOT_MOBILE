import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { rateHost } from "@/src/api/rating/ratingApi.index";
import { getSessionDetail } from "@/src/api/session-detail/sessionDetailApi.index";
import BadIcon from "@/src/assets/icon/rating/bad.svg";
import GoodIcon from "@/src/assets/icon/rating/good.svg";
import { Button } from "@/src/components/common/button/Button";
import Chip from "@/src/components/common/chip";
import { colors, spacing, fontSizes, fontWeights } from "@/src/constants";
import { RatingType } from "@/src/types/api/rating";

const FEEDBACK_TAGS = [
  "코스가 좋아요",
  "페이스 조절이 완벽해요",
  "친절해요",
  "매너가 좋아요",
  "시간을 잘 지켜요",
];

export default function HostRatingScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  const [rating, setRating] = useState<RatingType | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const {
    data: sessionData,
    isLoading: isSessionLoading,
    isError: isSessionError,
    refetch,
  } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => getSessionDetail(Number(sessionId)),
    enabled: !!sessionId,
  });

  // 호스트 평가 제출
  const { mutate: submitRating, isPending: isSubmitting } = useMutation({
    mutationFn: (data: { rating: RatingType; tags: string[] }) =>
      rateHost(Number(sessionId), data),
    onSuccess: () => {
      Alert.alert("평가 완료", "호스트 평가가 제출 되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            setRating(null);
            setSelectedTags([]);
            router.back();
          },
        },
      ]);
    },
    onError: (error) => {
      console.error("호스트 평가 실패:", error);
    },
  });

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const handleSubmit = () => {
    if (!rating) return;
    submitRating({ rating, tags: selectedTags });
  };

  if (isSessionLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (isSessionError || !sessionData) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>데이터를 불러오지 못했습니다.</Text>
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

  const hostName = sessionData.hostName;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 호스트 프로필 섹션 */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{hostName.charAt(0)}</Text>
            <View style={styles.hostBadge}>
              <Text style={styles.hostBadgeText}>HOST</Text>
            </View>
          </View>
          <Text style={styles.hostName}>{hostName}</Text>
        </View>

        {/* 긍정/부정 평가 선택 섹션 */}
        <View style={styles.ratingSection}>
          <Text style={styles.questionText}>
            {hostName}님의 진행이 만족스러웠나요?
          </Text>

          <View style={styles.ratingButtonsContainer}>
            {/* 별로예요 버튼 */}
            <TouchableOpacity
              style={[
                styles.circleButton,
                rating === "NEGATIVE" && styles.circleButtonSelectedNegative,
              ]}
              onPress={() => setRating("NEGATIVE")}
              activeOpacity={0.7}
              disabled={isSubmitting}
            >
              <BadIcon
                width={30}
                height={30}
                color={rating === "NEGATIVE" ? colors.white : colors.gray200}
              />
              <Text
                style={[
                  styles.circleButtonText,
                  rating === "NEGATIVE" && styles.circleButtonTextSelected,
                ]}
              >
                별로예요
              </Text>
            </TouchableOpacity>

            {/* 최고예요 버튼 */}
            <TouchableOpacity
              style={[
                styles.circleButton,
                rating === "POSITIVE" && styles.circleButtonSelectedPositive,
              ]}
              onPress={() => setRating("POSITIVE")}
              activeOpacity={0.7}
              disabled={isSubmitting}
            >
              <GoodIcon
                width={30}
                height={30}
                color={rating === "POSITIVE" ? colors.white : colors.gray200}
              />
              <Text
                style={[
                  styles.circleButtonText,
                  rating === "POSITIVE" && styles.circleButtonTextSelected,
                ]}
              >
                최고예요
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 추가 피드백 태그 섹션 */}
        <View style={styles.tagSection}>
          <Text style={styles.tagSectionTitle}>추가 피드백 (선택)</Text>
          <View style={styles.tagWrapper}>
            {FEEDBACK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Chip
                  key={tag}
                  label={
                    <Text
                      style={
                        isSelected ? styles.chipTextSelected : styles.chipText
                      }
                    >
                      {tag}
                    </Text>
                  }
                  variant={isSelected ? "filled" : "outlined"}
                  color={isSelected ? "primary" : "default"}
                  onPress={() => handleToggleTag(tag)}
                  disabled={isSubmitting}
                  style={styles.chipStyle}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* 하단 고정 평가 완료 버튼 */}
      <View style={styles.bottomArea}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={rating === null || isSubmitting}
          onPress={handleSubmit}
        >
          {isSubmitting ? "평가 제출 중..." : "평가 완료"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
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
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerEmpty: { width: 28 },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  closeButton: { padding: spacing.xs },

  // Profile
  profileSection: {
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    position: "relative",
    marginBottom: spacing.md,
    backgroundColor: colors.main,
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
  },
  hostBadge: {
    position: "absolute",
    bottom: -10,
    alignSelf: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  hostBadgeText: {
    color: colors.white,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
  },
  hostName: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },

  // Rating Buttons
  ratingSection: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
  },
  questionText: {
    fontSize: fontSizes.base,
    color: colors.gray600,
    marginBottom: spacing.xl,
  },
  ratingButtonsContainer: {
    flexDirection: "row",
    gap: spacing.xxl,
  },
  circleButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.bgSecondary,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  circleButtonSelectedPositive: {
    backgroundColor: colors.main,
  },
  circleButtonSelectedNegative: {
    backgroundColor: colors.gray600,
  },
  circleButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.gray500,
  },
  circleButtonTextSelected: {
    color: colors.white,
  },

  // Tag Section
  tagSection: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  tagSectionTitle: {
    fontSize: fontSizes.sm,
    color: colors.gray500,
    marginBottom: spacing.lg,
  },
  tagWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
  },
  chipStyle: {
    marginBottom: spacing.xs,
  },
  chipText: {
    color: colors.gray600,
    fontSize: fontSizes.sm,
  },
  chipTextSelected: {
    color: colors.white,
    fontWeight: fontWeights.semibold,
  },

  // Bottom Area
  bottomArea: {
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
