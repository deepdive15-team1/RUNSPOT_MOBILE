import {
  getMapMarkers as realgetMapMarkers,
  searchSessions as realSearchSessions,
} from "@/src/api/search/searchApi";
import {
  getMapMarkers as mockgetMapMarkers,
  searchSessions as mockSearchSessions,
} from "@/src/api/search/searchApi.mock";

const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

/**
 * 지도 영역 내 마커 검색
 * @param params - 마커 검색을 위한 지도의 경계 좌표 (leftX, leftY, rightX, rightY)
 * @returns 지도 위에 표시할 마커 목록 (MapMarkerResponse 배열)
 */
export const getMapMarkers = isMock ? mockgetMapMarkers : realgetMapMarkers;

/**
 * 러닝 세션 키워드 검색 (지역 또는 크루명)
 * @param params - 검색 키워드(q), 요청 사이즈(size), 다음 페이지 기준 커서(cursorId)
 * @returns 검색 조건에 맞는 러닝 세션 목록 및 페이징 정보 (RunningSearchResponse)
 */
export const searchSessions = isMock ? mockSearchSessions : realSearchSessions;
