import { useRouter } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";

import { Button } from "@/src/components/common/button/Button";
import Chip from "@/src/components/common/chip";
import { theme } from "@/src/constants";
import { RunningItem } from "@/src/types/api/search";

export function BottomOverlay({
  id,
  title,
  startAt,
  locationName,
  targetDistanceKm,
  avgPaceSec,
  genderPolicy,
  runType,
}: RunningItem) {
  const date = new Date(startAt);

  const formatted = date.toLocaleDateString("ko-KR", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const paceMinte = Math.floor(avgPaceSec / 60);
  const paceSecond = avgPaceSec % 60;
  const paceFomatting = `${paceMinte}: ${paceSecond === 0 ? "00" : paceSecond}`;

  const router = useRouter();

  return (
    <View style={styles.bottomOverlay}>
      <View style={styles.titleContainer}>
        <View style={styles.titleTextWrapper}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subText}>{formatted}</Text>
          <Text>{locationName}</Text>
        </View>
        <View>
          <Button
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

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {targetDistanceKm}km , 평균 페이스: {paceFomatting}km/h
        </Text>
        <View style={styles.chipContainer}>
          <Chip color="secondary" label={genderPolicy} />
          <Chip color="secondary" label={runType} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomOverlay: {
    position: "absolute",
    bottom: 40,
    backgroundColor: theme.colors.bg,
    borderRadius: theme.borderRadius.md,
    padding: 20,
    left: 20,
    right: 20,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: theme.borderRadius.md,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  titleContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    alignItems: "center",
  },

  titleTextWrapper: {
    flex: 1,
    gap: 4,
  },

  titleText: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text,
  },

  subText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray500,
  },

  infoContainer: {
    gap: 8,
  },

  infoText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray500,
  },

  chipContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap", // 화면이 좁아 칩이 많아질 경우 밑으로 내려가도록 처리
  },
});
