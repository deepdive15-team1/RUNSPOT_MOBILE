import { NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";

import SearchSvg from "../../src/assets/icon/search.svg";

import {
  getMapMarkers,
  getSessionSummary,
} from "@/src/api/search/searchApi.index";
import { Input } from "@/src/components/common/Input/Input";
import Chip from "@/src/components/common/chip";
import { NaverMapComponent } from "@/src/components/common/map/NaverMapComponent";
import { BottomOverlay } from "@/src/components/search/BottomOverLay";
import { theme } from "@/src/constants";
import { useCurrentLocation } from "@/src/hooks/search/useCurrentLocation";
import { GetMarkersParams } from "@/src/types/api/search";

const MOCK_FILTERS = ["3km 이내", "오늘", "10km 이상"];
const SEARCH_DEBOUNCE_MS = 300;
const CACHE_TIME_1_MIN = 1000 * 60;
const CACHE_TIME_5_MIN = 1000 * 60 * 5;

export default function SearchScreen() {
  const router = useRouter();
  const { camera } = useCurrentLocation();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null,
  );
  const [bounds, setBounds] = useState<GetMarkersParams | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<NaverMapViewRef>(null);

  const { data: markers = [] } = useQuery({
    queryKey: ["mapMarkers", bounds],
    queryFn: () => getMapMarkers(bounds!),
    enabled: !!bounds,
    staleTime: CACHE_TIME_1_MIN,
  });

  const { data: selectedCourse, isFetching: isDetailLoading } = useQuery({
    queryKey: ["sessionDetail", selectedSessionId],
    queryFn: () => getSessionSummary(selectedSessionId!),
    enabled: !!selectedSessionId,
    staleTime: CACHE_TIME_5_MIN,
  });

  const mapMarkers = useMemo(() => {
    return markers.map((course) => ({
      id: course.id,
      longitude: course.x,
      latitude: course.y,
      onTap: () => setSelectedSessionId(course.id),
    }));
  }, [markers, setSelectedSessionId]);

  // 컴포넌트 언마운트 시 디바운스 타이머 클리어
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (camera) {
      const trackingTimer = setTimeout(() => {
        mapRef.current?.setLocationTrackingMode("NoFollow");
      }, 200);

      return () => clearTimeout(trackingTimer);
    }
  }, [camera]);

  if (camera === null) {
    return (
      <View style={styles.findLocation}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>현재 위치를 찾고 있습니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NaverMapComponent
        camera={camera}
        markers={mapMarkers}
        ref={mapRef}
        onMapTap={() => setSelectedSessionId(null)}
        isScrollGesturesEnabled
        showLocationButton
        onCameraChanged={(e) => {
          if (bounds !== null && e.reason !== "Gesture") return;

          // 유저가 계속 드래그 중이라면, 기존에 걸어둔 타이머을 취소
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }

          debounceTimerRef.current = setTimeout(() => {
            setBounds({
              leftX: e.region.longitude - e.region.longitudeDelta / 2,
              leftY: e.region.latitude - e.region.latitudeDelta / 2,
              rightX: e.region.longitude + e.region.longitudeDelta / 2,
              rightY: e.region.latitude + e.region.latitudeDelta / 2,
            });
          }, SEARCH_DEBOUNCE_MS);
        }}
      />
      <View style={styles.topOverlay}>
        {/* 실제 검색은 search-result 페이지에서 실행 */}
        <Pressable onPress={() => router.push("/(main)/search-result")}>
          <View pointerEvents="none">
            <Input
              placeholder="지역 또는 크루 검색"
              startIcon={<SearchSvg />}
              editable={false}
            />
          </View>
        </Pressable>

        <View style={styles.chipContainer}>
          {MOCK_FILTERS.map((text) => (
            <Chip key={text} label={text} />
          ))}
        </View>
      </View>
      {isDetailLoading && (
        <View style={styles.detailLoadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
      {selectedCourse && <BottomOverlay {...selectedCourse} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topOverlay: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 40,
    gap: 12,
  },

  chipContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  findLocation: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: theme.colors.gray500,
    fontSize: theme.fontSizes.sm,
  },

  detailLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
