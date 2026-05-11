import {
  getMapMarkers as realgetMapMarkers,
  getSessionDetail as realgetSessionDetail,
} from "@/src/api/search/searchApi";
import {
  getMapMarkers as mockgetMapMarkers,
  getSessionDetail as mockgetSessionDetail,
} from "@/src/api/search/searchApi.mock";

const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

/**
 * 지도 영역 내 마커 검색
 * @param params - 마커 검색을 위한 지도의 경계 좌표 (leftX, leftY, rightX, rightY)
 * @returns 지도 위에 표시할 마커 목록 (MapMarkerResponse 배열)
 */
export const getMapMarkers = isMock ? mockgetMapMarkers : realgetMapMarkers;

/**
 * 러닝 세션 상세 정보 조회
 * @param sessionId - 조회할 러닝 세션의 고유 ID
 * @returns 러닝 세션의 상세 정보 (RunningItem)
 */
export const getSessionDetail = isMock
  ? mockgetSessionDetail
  : realgetSessionDetail;
