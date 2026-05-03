import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  borderRadius,
  colors,
  fontSizes,
  fontWeights,
  spacing,
} from "@/src/constants";
import type { NearbySessionResponse } from "@/src/types/api/nearbySession";
import { formatStartAt, secondsToPaceString } from "@/src/utils/pace";

export interface NearbyItemProps {
  session: NearbySessionResponse;
  onPress: () => void;
}

export function NearbyItem({ session, onPress }: NearbyItemProps) {
  const {
    title,
    applicants,
    maxCapacity,
    locationName,
    distanceFromPositionKm,
    targetDistanceKm,
    avgPaceSec,
    startAt,
  } = session;

  const distanceStr =
    distanceFromPositionKm >= 1
      ? `${distanceFromPositionKm.toFixed(1)}km`
      : `${(distanceFromPositionKm * 1000).toFixed(0)}m`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.chip}>
          <Text style={styles.chipText}>
            {applicants}/{maxCapacity}명 모집중
          </Text>
        </View>
      </View>
      <Text style={styles.cardLocation}>
        {locationName} ㆍ {distanceStr} 거리
      </Text>
      <View style={styles.cardMetrics}>
        <Text style={styles.metric}>{targetDistanceKm}km</Text>
        <Text style={styles.metricDivider}>|</Text>
        <Text style={styles.metric}>{secondsToPaceString(avgPaceSec)}/km</Text>
        <Text style={styles.metricDivider}>|</Text>
        <Text style={styles.metric}>{formatStartAt(startAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: spacing.base,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
    gap: spacing.sm,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  chip: {
    backgroundColor: colors.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  chipText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.white,
  },
  cardLocation: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  cardMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
  },
  metric: {
    fontSize: fontSizes.xs,
    color: colors.gray600,
  },
  metricDivider: {
    fontSize: fontSizes.xs,
    color: colors.gray300,
  },
});
