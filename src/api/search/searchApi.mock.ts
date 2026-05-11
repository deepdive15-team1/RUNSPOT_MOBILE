import type {
  MapMarkerResponse,
  RunningItem,
  GetMarkersParams,
} from "@/src/types/api/search";

/**
 * 1. 지도 마커 검색
 */
export const getMapMarkers = async (
  _params: GetMarkersParams,
): Promise<MapMarkerResponse[]> => {
  return [
    { id: 201, title: "여의도 한강공원 나이트런", x: 126.9333, y: 37.5271 },
    { id: 202, title: "남산 북측순환로 업힐 훈련", x: 126.9897, y: 37.5532 },
    { id: 203, title: "올림픽공원 주말 모닝 LSD", x: 127.1214, y: 37.5206 },
  ];
};

/**
 * 2. 세션 요약 정보
 */
export const getSessionDetail = async (
  sessionId: number,
): Promise<RunningItem> => {
  return {
    id: sessionId,
    title: "여의도 한강공원 나이트런",
    startAt: "2026-05-08T11:00:00.000Z",
    locationName: "서울시 영등포구 여의도 한강공원",
    targetDistanceKm: 10,
    avgPaceSec: 300,
    genderPolicy: "ALL",
    runType: "RECOVERY",
  };
};
