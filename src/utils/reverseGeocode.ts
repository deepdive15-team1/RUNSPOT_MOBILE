import * as Location from "expo-location";

const FALLBACK_PLACE_NAME = "선택한 위치";

/** 기기 로케일이 영어일 때 자주 나오는 시·도명 */
const REGION_EN_TO_KO: Record<string, string> = {
  Seoul: "서울특별시",
  Busan: "부산광역시",
  Incheon: "인천광역시",
  Daegu: "대구광역시",
  Daejeon: "대전광역시",
  Gwangju: "광주광역시",
  Ulsan: "울산광역시",
  Sejong: "세종특별자치시",
  "Gyeonggi-do": "경기도",
  "Gangwon-do": "강원특별자치도",
  "Chungcheongbuk-do": "충청북도",
  "Chungcheongnam-do": "충청남도",
  "Jeollabuk-do": "전북특별자치도",
  "Jeollanam-do": "전라남도",
  "Gyeongsangbuk-do": "경상북도",
  "Gyeongsangnam-do": "경상남도",
  "Jeju-do": "제주특별자치도",
};

function normalizePart(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  return value
    .trim()
    .replace(/^대한민국\s*/u, "")
    .replace(/^Republic of Korea,?\s*/iu, "")
    .replace(/^South Korea,?\s*/iu, "")
    .trim();
}

function toKoreanRegion(value: string | null | undefined): string {
  const normalized = normalizePart(value);
  if (!normalized) return "";
  return REGION_EN_TO_KO[normalized] ?? normalized;
}

function formatStreetLine(address: Location.LocationGeocodedAddress): string {
  const street = normalizePart(address.street);
  const streetNumber = normalizePart(address.streetNumber);
  if (street && streetNumber) return `${street} ${streetNumber}`;
  return street || streetNumber;
}

function dedupeParts(parts: string[]): string[] {
  const result: string[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const isDuplicate = result.some(
      (existing) =>
        existing === trimmed ||
        existing.includes(trimmed) ||
        trimmed.includes(existing),
    );
    if (!isDuplicate) result.push(trimmed);
  }

  return result;
}

function cleanFormattedAddress(
  formattedAddress: string | null | undefined,
): string {
  const normalized = normalizePart(formattedAddress);
  if (!normalized) return "";

  // "대한민국 서울특별시 ..."처럼 이미 행정구역 순이면 그대로 사용
  return normalized;
}

/**
 * 시·도 → 시·군·구 → 동 → 도로명 → 건물명 순으로 한국어 주소를 만듭니다.
 */
function formatGeocodedAddress(
  address: Location.LocationGeocodedAddress,
): string {
  const placeName = normalizePart(address.name);
  const streetLine = formatStreetLine(address);

  const adminParts = dedupeParts([
    toKoreanRegion(address.region),
    toKoreanRegion(address.subregion),
    normalizePart(address.city),
    normalizePart(address.district),
    streetLine,
  ]);

  if (placeName && !adminParts.some((part) => part.includes(placeName))) {
    adminParts.push(placeName);
  }

  if (adminParts.length > 0) {
    return adminParts.join(" ");
  }

  return cleanFormattedAddress(address.formattedAddress) || FALLBACK_PLACE_NAME;
}

/** 좌표를 장소명·도로명·주소 문자열로 변환합니다. */
export async function getPlaceNameFromCoordinates(
  longitude: number,
  latitude: number,
): Promise<string> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    const first = results[0];
    if (!first) return FALLBACK_PLACE_NAME;
    return formatGeocodedAddress(first);
  } catch (error) {
    console.warn("역지오코딩 실패", error);
    return FALLBACK_PLACE_NAME;
  }
}
