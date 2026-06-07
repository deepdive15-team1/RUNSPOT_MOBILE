import { useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/common/button/Button";
import type { MarkerType } from "@/src/components/common/map/NaverMapComponent";
import { NaverMapComponent } from "@/src/components/common/map/NaverMapComponent";
import { colors, fontSizes, spacing } from "@/src/constants";
import { useCreateSessionDraftStore } from "@/src/stores/createSessionDraftStore";
import type { RoutePolyline } from "@/src/types/domain/createSessionDraft";

const DEFAULT_CAMERA = { latitude: 37.5665, longitude: 126.978, zoom: 14 };

function toDistanceKm(path: RoutePolyline): string {
  if (path.length < 2) return "";
  const earthRadius = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  let totalMeter = 0;

  for (let i = 1; i < path.length; i += 1) {
    const prev = path[i - 1];
    const curr = path[i];
    const lat1 = toRad(prev.y);
    const lat2 = toRad(curr.y);
    const dLat = lat2 - lat1;
    const dLon = toRad(curr.x - prev.x);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalMeter += earthRadius * c;
  }

  return (Math.round((totalMeter / 1000) * 100) / 100).toString();
}

/**
 * 러닝 코스 그리기 화면.
 * 지도 탭 좌표를 routePolyline에 누적하고 파생 필드를 스토어에 동기화
 */
export default function DrawRunningCourseScreen() {
  const router = useRouter();
  const routePolyline = useCreateSessionDraftStore((s) => s.routePolyline);
  const locationName = useCreateSessionDraftStore((s) => s.locationName);
  const targetDistanceKm = useCreateSessionDraftStore(
    (s) => s.targetDistanceKm,
  );
  const locationX = useCreateSessionDraftStore((s) => s.locationX);
  const locationY = useCreateSessionDraftStore((s) => s.locationY);
  const setDraft = useCreateSessionDraftStore((s) => s.setDraft);

  // 네이버 지도 API 포맷에 맞게 변환
  const routePath = useMemo(
    () => routePolyline.map((p) => ({ latitude: p.y, longitude: p.x })),
    [routePolyline],
  );

  const markers = useMemo<MarkerType[]>(() => {
    if (routePolyline.length === 0) return [];
    const start = routePolyline[0];
    const end = routePolyline[routePolyline.length - 1];
    const result: MarkerType[] = [
      {
        id: "start",
        latitude: start.y,
        longitude: start.x,
        caption: "출발",
      },
    ];
    if (routePolyline.length > 1) {
      result.push({
        id: "end",
        latitude: end.y,
        longitude: end.x,
        caption: "도착",
      });
    }
    return result;
  }, [routePolyline]);

  const camera = useMemo(() => {
    if (routePolyline.length === 0) return DEFAULT_CAMERA;
    const first = routePolyline[0];
    return { latitude: first.y, longitude: first.x, zoom: 15 };
  }, [routePolyline]);

  const handleMapTap = (lat: number, lng: number) => {
    const nextRoute = [...routePolyline, { x: lng, y: lat }];
    const start = nextRoute[0];
    setDraft({
      routePolyline: nextRoute,
      locationX: start.x.toString(),
      locationY: start.y.toString(),
      locationName: "선택한 위치",
      targetDistanceKm: toDistanceKm(nextRoute),
    });
  };

  const handleClear = () => {
    setDraft({
      routePolyline: [],
      locationName: "",
      targetDistanceKm: "",
      locationX: "",
      locationY: "",
    });
  };

  return (
    <View style={styles.root}>
      <NaverMapComponent
        camera={camera}
        markers={markers}
        routePath={routePath}
        isCreateMode
        isScrollGesturesEnabled
        isZoomGesturesEnabled
        onMapTap={handleMapTap}
        style={styles.mapWrap}
      />

      <View style={styles.bottomSheet}>
        <Text style={styles.note}>
          지도를 탭해 코스를 그리세요. 첫 좌표를 출발지로 저장하고, 전체 경로
          길이를 목표 거리로 반영합니다.
        </Text>
        <View style={styles.metaBox}>
          <Text style={styles.metaText}>장소명: {locationName || "-"}</Text>
          <Text style={styles.metaText}>
            거리(km): {targetDistanceKm || "-"}
          </Text>
          <Text style={styles.metaText}>경도(x): {locationX || "-"}</Text>
          <Text style={styles.metaText}>위도(y): {locationY || "-"}</Text>
          <Text style={styles.metaText}>포인트 수: {routePolyline.length}</Text>
        </View>
        <View style={styles.actionRow}>
          <Button variant="outline" size="sm" flex onPress={handleClear}>
            초기화
          </Button>
          <Button
            variant="primary"
            size="sm"
            flex
            onPress={() => router.back()}
          >
            적용하고 돌아가기
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  mapWrap: {
    flex: 1,
  },
  bottomSheet: {
    position: "absolute",
    left: spacing.base,
    right: spacing.base,
    bottom: spacing.base,
    borderRadius: 12,
    backgroundColor: colors.bg,
    padding: spacing.base,
    gap: spacing.sm,
  },
  note: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  metaBox: {
    width: "100%",
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSizes.xs,
    color: colors.text,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
  },
});
