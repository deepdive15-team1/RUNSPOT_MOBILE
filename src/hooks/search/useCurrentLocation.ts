import * as Location from "expo-location";
import { useState, useEffect } from "react";
import { Alert } from "react-native";

// 기본 위치
const DEFAULT_LOCATION = { latitude: 36.5, longitude: 127.5, zoom: 6 };

export function useCurrentLocation() {
  const [camera, setCamera] = useState<{
    latitude: number;
    longitude: number;
    zoom: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (!isMounted) return;
          Alert.alert(
            "위치 권한 필요",
            "위치 권한이 없어 전국 지도를 표시합니다.",
            [{ text: "확인" }],
          );
          setCamera(DEFAULT_LOCATION);
          return;
        }

        let location = await Location.getLastKnownPositionAsync({});

        if (!location) {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("위치 찾기 타임아웃")), 5000),
          );
          const locationPromise = Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          // 5초 타임아웃 적용
          location = await Promise.race([locationPromise, timeoutPromise]);
        }

        if (!isMounted) return;
        setCamera({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          zoom: 14,
        });
      } catch (error) {
        if (!isMounted) return;
        console.warn("위치 로드 실패", error);
        setCamera(DEFAULT_LOCATION);
      }
    };

    fetchCurrentLocation();
    return () => {
      isMounted = false;
    };
  }, []);

  return { camera };
}
