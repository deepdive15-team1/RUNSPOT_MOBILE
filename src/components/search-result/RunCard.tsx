import { useRouter } from "expo-router";
import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

import { Button } from "../common/button/Button";
import Chip from "../common/chip";

import { theme } from "@/src/constants";
import { RunningItem } from "@/src/types/api/search";
import { GenderPolicy, RunType } from "@/src/types/search/search";
import { secondsToPaceString } from "@/src/utils";

const GENDER_INFO: Record<
  GenderPolicy,
  { label: string; color: "default" | "green" }
> = {
  MALE_ONLY: { label: "남성", color: "default" },
  FEMALE_ONLY: { label: "여성", color: "default" },
  MIXED: { label: "남녀무관", color: "green" },
};

const RUN_TYPE_INFO: Record<
  RunType,
  { label: string; color: "primary" | "red" | "yellow" }
> = {
  RECOVERY: { label: "리커버리", color: "primary" },
  INTERVAL: { label: "인터벌", color: "red" },
  LSD: { label: "LSD", color: "yellow" },
};

const formatDisplayDate = (isoString: string) => {
  const d = new Date(isoString);
  const month = d.getMonth() + 1;
  const day = d.getDate();

  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dayOfWeek = days[d.getDay()];

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "오후" : "오전";

  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${month}.${day}(${dayOfWeek}) ${ampm} ${hours}:${minutes}`;
};

export const RunCard = memo(function RunCard({
  id,
  title,
  startAt,
  locationName,
  targetDistanceKm,
  avgPaceSec,
  genderPolicy,
  runType,
}: RunningItem) {
  const router = useRouter();

  const genderInfo = GENDER_INFO[genderPolicy] || GENDER_INFO.MIXED;
  const runTypeInfo = RUN_TYPE_INFO[runType] || RUN_TYPE_INFO.LSD;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.subInfoRow}>
        <Text style={styles.subInfoText}>{formatDisplayDate(startAt)}</Text>
      </View>

      <View style={styles.subInfoRow}>
        <Text style={styles.subInfoText}>{locationName}</Text>
      </View>

      <View style={styles.paceRow}>
        <Chip label={`${targetDistanceKm}km`} color="primary" size="small" />
        <Text style={styles.paceText}>
          평균 페이스 {secondsToPaceString(avgPaceSec)}/km
        </Text>
      </View>

      <View style={styles.tagsRow}>
        <Chip label={genderInfo.label} color={genderInfo.color} size="small" />
        <Chip
          label={runTypeInfo.label}
          color={runTypeInfo.color}
          size="small"
        />
      </View>

      <View style={styles.actionRow}>
        <Button
          size="sm"
          variant="primary"
          wrapperStyle={styles.customButtonWrapper}
          textStyle={styles.customButtonText}
          onPress={() =>
            router.push({
              pathname: "/(main)/session-detail",
              params: { id },
            })
          }
        >
          상세보기
        </Button>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadowStyle.sm,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.gray900,
    marginBottom: theme.spacing.sm,
  },
  subInfoRow: {
    marginBottom: theme.spacing.md,
  },
  subInfoText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray500,
    fontWeight: theme.fontWeights.medium,
  },
  paceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  paceText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.gray900,
  },
  tagsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    marginBottom: theme.spacing.base,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  customButtonWrapper: {
    backgroundColor: theme.colors.mainLight,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    height: 40,
  },
  customButtonText: {
    color: theme.colors.main,
    fontWeight: theme.fontWeights.bold,
  },
});
