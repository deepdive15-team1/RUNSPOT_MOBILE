import { Ionicons } from "@expo/vector-icons";
import { NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  InteractionManager,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "@/src/components/common/button/Button";
import type { MarkerType } from "@/src/components/common/map/NaverMapComponent";
import { NaverMapComponent } from "@/src/components/common/map/NaverMapComponent";
import { colors, fontSizes, spacing } from "@/src/constants";
import { useCurrentLocation } from "@/src/hooks/search/useCurrentLocation";
import { useCreateSessionDraftStore } from "@/src/stores/createSessionDraftStore";
import type { RoutePolyline } from "@/src/types/domain/createSessionDraft";
import { getPlaceNameFromCoordinates } from "@/src/utils/reverseGeocode";

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
  const mapRef = useRef<NaverMapViewRef>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isMovingToLocation, setIsMovingToLocation] = useState(false);
  const { camera: currentLocationCamera } = useCurrentLocation();
  const routePolyline = useCreateSessionDraftStore((s) => s.routePolyline);
  const locationName = useCreateSessionDraftStore((s) => s.locationName);
  const targetDistanceKm = useCreateSessionDraftStore(
    (s) => s.targetDistanceKm,
  );
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
    if (routePolyline.length > 0) {
      const first = routePolyline[0];
      return { latitude: first.y, longitude: first.x, zoom: 15 };
    }
    return currentLocationCamera ?? DEFAULT_CAMERA;
  }, [routePolyline, currentLocationCamera]);

  const isLoadingLocation =
    routePolyline.length === 0 && currentLocationCamera === null;

  const startLng = routePolyline[0]?.x;
  const startLat = routePolyline[0]?.y;

  useEffect(() => {
    if (startLng === undefined || startLat === undefined) return;

    let cancelled = false;
    getPlaceNameFromCoordinates(startLng, startLat).then((name) => {
      if (!cancelled) {
        setDraft({ locationName: name });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [startLng, startLat, setDraft]);

  const handleMapTap = (lat: number, lng: number) => {
    const nextRoute = [...routePolyline, { x: lng, y: lat }];
    const start = nextRoute[0];
    setDraft({
      routePolyline: nextRoute,
      locationX: start.x.toString(),
      locationY: start.y.toString(),
      ...(nextRoute.length === 1 ? { locationName: "" } : {}),
      targetDistanceKm: toDistanceKm(nextRoute),
    });
  };

  const placeNameLabel =
    locationName || (routePolyline.length > 0 ? "장소명 조회 중..." : "-");

  const handleClear = () => {
    setDraft({
      routePolyline: [],
      locationName: "",
      targetDistanceKm: "",
      locationX: "",
      locationY: "",
    });
  };

  const handleMoveToCurrentLocation = async () => {
    if (isMovingToLocation) return;

    try {
      setIsMovingToLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "위치 권한 필요",
          "현재 위치로 이동하려면 위치 권한이 필요합니다.",
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = position.coords;

      mapRef.current?.animateCameraTo({
        latitude,
        longitude,
        zoom: 15,
        duration: 500,
      });
    } catch {
      Alert.alert("위치 오류", "현재 위치를 가져오지 못했습니다.");
    } finally {
      setIsMovingToLocation(false);
    }
  };

  const handleApply = () => {
    if (routePolyline.length < 2) {
      Alert.alert("코스 미완성", "2개 이상의 포인트를 찍어주세요.");
      return;
    }
    setIsLeaving(true);
  };

  useEffect(() => {
    if (!isLeaving) return;

    const task = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        router.replace("/(main)/create-session");
      });
    });

    return () => task.cancel();
  }, [isLeaving, router]);

  if (isLoadingLocation || isLeaving) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.main} />
        <Text style={styles.loadingText}>
          {isLeaving ? "적용 중..." : "현재 위치를 찾고 있습니다"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <NaverMapComponent
        ref={mapRef}
        camera={camera}
        markers={markers}
        routePath={routePath}
        isScrollGesturesEnabled
        isZoomGesturesEnabled
        onMapTap={handleMapTap}
        style={styles.mapWrap}
      />

      <Pressable
        style={styles.myLocationButton}
        onPress={handleMoveToCurrentLocation}
        disabled={isMovingToLocation}
        accessibilityRole="button"
        accessibilityLabel="현재 위치로 이동"
      >
        {isMovingToLocation ? (
          <ActivityIndicator size="small" color={colors.main} />
        ) : (
          <Ionicons name="locate" size={22} color={colors.main} />
        )}
      </Pressable>

      <View style={styles.bottomSheet}>
        <Text style={styles.note}>
          지도를 탭해 코스를 그리세요. 첫 좌표를 출발지로 저장하고, 전체 경로
          길이를 목표 거리로 반영합니다.
        </Text>
        <View style={styles.metaBox}>
          <Text style={styles.metaText}>장소명: {placeNameLabel}</Text>
          <Text style={styles.metaText}>
            거리(km): {targetDistanceKm || "-"}
          </Text>
          <Text style={styles.metaText}>포인트 수: {routePolyline.length}</Text>
        </View>
        <View style={styles.actionRow}>
          <Button variant="outline" size="sm" flex onPress={handleClear}>
            초기화
          </Button>
          <Button variant="primary" size="sm" flex onPress={handleApply}>
            적용하고 돌아가기
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  mapWrap: {
    flex: 1,
  },
  myLocationButton: {
    position: "absolute",
    right: spacing.base,
    top: spacing.base,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: { elevation: 6 },
    }),
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
    zIndex: 10,
    ...Platform.select({
      android: { elevation: 8 },
    }),
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
