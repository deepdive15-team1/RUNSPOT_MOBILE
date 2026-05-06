import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { nearbySession } from "@/src/api/nearbySession/nearbySessionApi.index";
import { Button } from "@/src/components/common/button/Button";
import { NearbyItem } from "@/src/components/nearbyList/NearbyItem";
import {
  borderRadius,
  colors,
  fontSizes,
  fontWeights,
  spacing,
} from "@/src/constants";
import type { NearbySessionResponse } from "@/src/types/api/nearbySession";

export interface NearbyListProps {
  /** 주변 세션 검색 경도 */
  x: number;
  /** 주변 세션 검색 위도 */
  y: number;
}

export function NearbyList({ x, y }: NearbyListProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<NearbySessionResponse[] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSessions(null);
    (async () => {
      try {
        const list = await nearbySession({ x, y, size: 3 });
        if (!cancelled) setSessions(list);
      } catch {
        if (!cancelled) setSessions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [x, y]);

  return (
    <View style={styles.outer}>
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>내 주변 추천 러닝</Text>
        <Button
          variant="text"
          size="xs"
          onPress={() => router.push("/(main)/search")}
        >
          전체보기 ›
        </Button>
      </View>

      <View style={styles.listBody}>
        {loading && (
          <View style={styles.messageRow}>
            <ActivityIndicator color={colors.main} />
            <Text style={styles.listMessage}>불러오는 중...</Text>
          </View>
        )}
        {!loading && sessions?.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.listMessage}>
              현 위치 기준으로 조회된 러닝 세션이 없습니다.
            </Text>
          </View>
        )}
        {!loading &&
          sessions &&
          sessions.length > 0 &&
          sessions.map((session) => (
            <NearbyItem
              key={session.id}
              session={session}
              onPress={() => router.push("/(main)/search")}
            />
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  listBody: {
    width: "100%",
    gap: spacing.sm,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 120,
  },
  emptyBox: {
    minHeight: 120,
    marginHorizontal: spacing.xs,
    padding: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  listMessage: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.gray600,
    textAlign: "center",
  },
});
