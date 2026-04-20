import {
  NaverMapView,
  NaverMapMarkerOverlay,
  NaverMapPathOverlay,
  MapImageProp,
  NaverMapViewRef,
} from "@mj-studio/react-native-naver-map";
import { useCallback, forwardRef, memo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { theme } from "@/src/constants";

export interface MarkerType {
  id: number | string;
  latitude: number;
  longitude: number;
  caption?: string; // 마커 위에 띄울 텍스트 (없으면 마커만 찍힘)
  image?: MapImageProp; // 이미지 경로 타입
  onTap?: () => void; //클릭 시 실행할 함수
}

interface NaverMapComponentProps {
  //지도 중심 위치 및 크기
  camera?: { latitude: number; longitude: number; zoom?: number };
  height?: number | string;
  style?: ViewStyle;

  // 마커 및 경로 데이터
  markers?: MarkerType[];
  routePath?: { latitude: number; longitude: number }[];

  // UI 및 기능 설정
  showLocationButton?: boolean; // 현재 위치로 가는 버튼 표시 여부
  isCreateMode?: boolean; // true면 코스 그리기 모드
  isShowZoomControls?: boolean;
  onMapTap?: (latitude: number, longitude: number) => void;

  // 커뮤니티용 정적 지도 설정
  // 스크롤뷰 안에서 지도가 움직이지 않게 고정할 때 사용
  isScrollGesturesEnabled?: boolean;
  isZoomGesturesEnabled?: boolean;

  // 경로 스타일
  lineColor?: string;
  lineWidth?: number;
}

export const NaverMapComponent = memo(
  forwardRef<NaverMapViewRef, NaverMapComponentProps>(
    (
      {
        camera,
        style,
        markers = [],
        routePath,
        showLocationButton = false,
        isCreateMode = false,
        isShowZoomControls = false,
        onMapTap,
        isScrollGesturesEnabled = false,
        isZoomGesturesEnabled = false,
        lineColor = theme.colors.main,
        lineWidth = 5,
      },
      ref,
    ) => {
      const handleMapTap = useCallback(
        (e: { latitude: number; longitude: number }) => {
          //코스 생성 모드일 때만 부모에게 좌표 전달
          if (isCreateMode && onMapTap) {
            onMapTap(e.latitude, e.longitude);
          }
        },
        [isCreateMode, onMapTap],
      );

      return (
        <View style={[styles.container, style]}>
          <NaverMapView
            ref={ref}
            style={styles.map}
            initialCamera={camera}
            isShowLocationButton={showLocationButton}
            isScrollGesturesEnabled={isScrollGesturesEnabled}
            isZoomGesturesEnabled={isZoomGesturesEnabled}
            onTapMap={handleMapTap}
            isShowZoomControls={isShowZoomControls} // 기본 줌 버튼 숨기기
          >
            {/* 마커 렌더링 */}
            {markers.map((marker) => (
              <NaverMapMarkerOverlay
                key={marker.id}
                latitude={marker.latitude}
                longitude={marker.longitude}
                caption={marker.caption ? { text: marker.caption } : undefined}
                image={marker.image}
                onTap={marker.onTap}
              />
            ))}

            {/* 경로 렌더링 */}
            {routePath && routePath.length > 1 && (
              <NaverMapPathOverlay
                coords={routePath}
                width={lineWidth}
                color={lineColor}
                outlineWidth={2}
              />
            )}
          </NaverMapView>
        </View>
      );
    },
  ),
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
