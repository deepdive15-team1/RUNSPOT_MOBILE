import * as Location from "expo-location";

import { getPlaceNameFromCoordinates } from "../src/utils/reverseGeocode";

// 외부 라이브러리(expo-location)를 Mock 객체로 대체하여 네트워크 및 GPS 의존성을 제거한다.
jest.mock("expo-location");
const mockedLocation = Location as jest.Mocked<typeof Location>;

/**
 * 좌표 기반의 주소 변환(Reverse Geocoding) 로직을 검증한다.
 * 외부 API 에러나 비정상 응답 시 앱이 크래시되지 않는지를 중점적으로 확인한다.
 */
describe("역지오코딩 유틸리티 검증 (reverseGeocode.ts)", () => {
  const FALLBACK_NAME = "선택한 위치";

  beforeEach(() => {
    // 테스트 간 격리성을 보장하기 위해 매번 Mock 호출 히스토리를 초기화한다.
    jest.clearAllMocks();
  });

  describe("주소 데이터 정제 및 변환", () => {
    it("★ 유효한 좌표 입력 시, 영문 행정구역명을 한국어로 번역하고 중복을 제거하여 반환한다", async () => {
      mockedLocation.reverseGeocodeAsync.mockResolvedValueOnce([
        {
          name: "스타벅스",
          street: "테헤란로",
          streetNumber: "123",
          region: "Seoul",
          subregion: "Gangnam-gu",
          city: "대한민국 서울특별시",
          district: "역삼동",
          formattedAddress: "대한민국 서울특별시 강남구 테헤란로 123 스타벅스",
        } as Location.LocationGeocodedAddress,
      ]);

      const result = await getPlaceNameFromCoordinates(127.0316, 37.5013);

      // 대한민국 제거, Seoul 번역, 중복된 서울특별시 제거 등 정제 파이프라인 검증
      expect(result).toBe("서울특별시 Gangnam-gu 역삼동 테헤란로 123 스타벅스");
      expect(mockedLocation.reverseGeocodeAsync).toHaveBeenCalledTimes(1);
    });

    it("★ 세부 주소 파편(adminParts)이 부족할 경우, 전체 주소(formattedAddress)에서 국가명을 정제하여 반환한다", async () => {
      mockedLocation.reverseGeocodeAsync.mockResolvedValueOnce([
        {
          formattedAddress: "대한민국 경기도 성남시 분당구",
          name: null,
          region: null,
        } as Location.LocationGeocodedAddress,
      ]);

      const result = await getPlaceNameFromCoordinates(127.1, 37.3);
      expect(result).toBe("경기도 성남시 분당구");
    });
  });

  describe("네트워크 및 예외 상황 방어 로직 (Fallback)", () => {
    it("★★ 위치 권한 거부 또는 API 500 에러 발생 시, 크래시 없이 기본(Fallback) 텍스트를 반환한다", async () => {
      // 의도된 에러 로그가 터미널 환경을 오염시키지 않도록 임시로 Spy 처리한다.
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {
        /* empty */
      });

      mockedLocation.reverseGeocodeAsync.mockRejectedValueOnce(
        new Error("Location permission denied"),
      );

      const result = await getPlaceNameFromCoordinates(0, 0);

      expect(result).toBe(FALLBACK_NAME);

      consoleSpy.mockRestore();
    });

    it("★★ 역지오코딩 응답 배열이 비어있는 비정상 케이스에서, 안전하게 기본(Fallback) 텍스트를 반환한다", async () => {
      mockedLocation.reverseGeocodeAsync.mockResolvedValueOnce([]);

      const result = await getPlaceNameFromCoordinates(127.0, 37.0);
      expect(result).toBe(FALLBACK_NAME);
    });
  });
});
