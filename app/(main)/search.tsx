import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";

import SearchSvg from "../../src/assets/icon/search.svg";

import {
  getMapMarkers,
  getSessionDetail,
} from "@/src/api/search/searchApi.index";
import { Input } from "@/src/components/common/Input/Input";
import Chip from "@/src/components/common/chip";
import { NaverMapComponent } from "@/src/components/common/map/NaverMapComponent";
import { BottomOverlay } from "@/src/components/search/BottomOverLay";
import {
  RunningItem,
  GetMarkersParams,
  MapMarkerResponse,
} from "@/src/types/api/search";

const MOCK_FILTERS = ["3km 이내", "오늘", "10km 이상"];

export default function SearchScreen() {
  const router = useRouter();

  const [selectedCourse, setSelectedCourse] = useState<RunningItem | null>(
    null,
  );
  const [camera, setCamera] = useState<{
    latitude: number;
    longitude: number;
    zoom: number;
  } | null>(null);

  const [bounds, setBounds] = useState<GetMarkersParams | null>(null);

  const [markers, setMarkers] = useState<MapMarkerResponse[]>([]);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  //디바운싱 타이머
  useEffect(() => {
    if (!bounds) return;

    const fetchMarkers = async () => {
      try {
        const data = await getMapMarkers(bounds);
        setMarkers((prevMarkers) => {
          const markerMap = new Map(prevMarkers.map((m) => [m.id, m]));

          data.forEach((m) => markerMap.set(m.id, m));

          return Array.from(markerMap.values());
        });
      } catch (error) {
        console.error("마커 가져오기 실패:", error);
      }
    };

    fetchMarkers();
  }, [bounds]);

  // 현재 위치로 지도 초기 위치 로딩
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status != "granted") {
        Alert.alert(
          "위치 권한 필요",
          "위치 권한이 없어 기본 지도를 표시합니다.\n상단 검색창을 통해 원하는 러닝 지역을 찾아보세요!",
          [{ text: "확인" }],
        );
        setCamera({
          // 위치 로딩 실패 시 대한민국 정중앙 부근의 좌표를 넣어서 전국이 보이게 유도
          latitude: 36.5,
          longitude: 127.5,
          zoom: 6, //  6으로 줌 아웃
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      setCamera({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        zoom: 14,
      });
    };

    fetchCurrentLocation();
  }, []);

  if (camera === null) {
    return (
      <View style={styles.findLocation}>
        <Text>현재 위치를 찾고 있습니다...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NaverMapComponent
        camera={camera}
        markers={markers.map((course) => ({
          id: course.id,
          longitude: course.x,
          latitude: course.y,
          onTap: async () => {
            try {
              const data = await getSessionDetail(course.id);
              setSelectedCourse(data);
            } catch (error) {
              console.error("상세정보 가져오기 실패", error);
            }
          },
        }))}
        onMapTap={() => setSelectedCourse(null)}
        isScrollGesturesEnabled
        onCameraChanged={(e) => {
          if (e.reason !== "Gesture") return; // 유저가 드래그한 게 아니라면 무시

          // 유저가 계속 드래그 중이라면, 기존에 걸어둔 예약(타이머)을 취소
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }

          // 드래그가 멈추고 0.2초가 지나면 한 번만 State를 업데이트
          debounceTimerRef.current = setTimeout(() => {
            setBounds({
              leftX: e.region.longitude,
              leftY: e.region.latitude,
              rightX: e.region.longitude + e.region.longitudeDelta,
              rightY: e.region.latitude + e.region.latitudeDelta,
            });
          }, 200); // 200ms 디바운스
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
          {MOCK_FILTERS.map((text, index) => (
            <Chip key={index} label={text} />
          ))}
        </View>
      </View>
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

  findLocation: { flex: 1, justifyContent: "center", alignItems: "center" },
});
