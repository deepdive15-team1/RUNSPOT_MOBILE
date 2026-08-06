import {
  resolveEffectiveMinimumDate,
  parseValueToDate,
  htmlTimeMinFromMinimum,
  clampDateTimePartsToMinimum,
  mergeDateAndTimeParts,
  splitDateAndTimeFromValue,
  displayFromValue,
  defaultDatePartForPicker,
  htmlDateOnlyFromLocalPart,
  toDatetimeLocalInputValue,
} from "../src/utils/datetime";

import { formatDate, formatDisplayDate } from "@/src/utils/date";

/**
 * 이 테스트는 런타임 환경과 무관하게 순수 날짜/시간 포맷팅 유틸리티의 동작을 검증한다.
 * 시스템 시간에 의존하여 발생하는 Flaky 테스트를 방지하기 위해 Fake Timers를 적용한다.
 */
describe("날짜 및 시간 유틸리티 검증 (datetime.ts)", () => {
  const SYSTEM_TIME = new Date("2026-08-01T12:00:00").getTime();

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(SYSTEM_TIME);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe("resolveEffectiveMinimumDate() - 최소 선택 가능 시각 계산", () => {
    it("★ 기준일(minimumDate)이 없을 경우, 현재 시각에 지연 시간(leadMs)을 더해 반환한다", () => {
      const leadMs = 60 * 60 * 1000;
      const result = resolveEffectiveMinimumDate(undefined, leadMs);
      expect(result?.getTime()).toBe(SYSTEM_TIME + leadMs);
    });

    it("★ 기준일과 지연 시간이 모두 존재할 경우, 둘 중 더 미래의 시각을 적용한다", () => {
      const pastDate = new Date(SYSTEM_TIME - 10000);
      const leadMs = 60 * 1000;
      const result = resolveEffectiveMinimumDate(pastDate, leadMs);
      expect(result?.getTime()).toBe(SYSTEM_TIME + leadMs);
    });

    it("★★ 지연 시간(leadMs)이 음수로 주입되는 비정상적인 경우, 원본 기준일을 훼손하지 않는다", () => {
      const validDate = new Date(SYSTEM_TIME + 10000);
      const result = resolveEffectiveMinimumDate(validDate, -500);
      expect(result?.getTime()).toBe(validDate.getTime());
    });
  });

  describe("parseValueToDate() - 문자열 파싱 방어 로직", () => {
    it("★★ 유효하지 않은 포맷이나 빈 문자열 입력 시, 앱 크래시를 방지하고 현재 시각을 반환한다", () => {
      expect(parseValueToDate("").getTime()).toBe(SYSTEM_TIME);
      expect(parseValueToDate("   ").getTime()).toBe(SYSTEM_TIME);
      expect(parseValueToDate("invalid-date-string").getTime()).toBe(
        SYSTEM_TIME,
      );
    });

    it("★ 유효한 ISO 8601 문자열은 정확한 Date 객체로 변환되어야 한다", () => {
      const valid = "2026-12-25T15:00:00";
      expect(parseValueToDate(valid).getTime()).toBe(new Date(valid).getTime());
    });
  });

  describe("htmlTimeMinFromMinimum() - HTML time input 제한 로직", () => {
    it("★ 선택한 날짜가 최소 제한 날짜와 동일할 경우, 정확한 시간(HH:mm)을 잘라서 반환한다", () => {
      const minLocalPart = "2026-08-15T14:30:00";
      const draftDate = "2026-08-15";
      expect(htmlTimeMinFromMinimum(minLocalPart, draftDate)).toBe("14:30");
    });

    it("★ 선택한 날짜가 최소 제한 날짜와 다를 경우, 시간 제한을 해제(undefined)한다", () => {
      const minLocalPart = "2026-08-15T14:30:00";
      const draftDate = "2026-08-20";
      expect(htmlTimeMinFromMinimum(minLocalPart, draftDate)).toBeUndefined();
    });

    it("★★ 제한 시간 데이터가 불완전하거나 날짜가 비어있을 경우, 폼 에러 방지를 위해 제한을 강제하지 않는다", () => {
      expect(htmlTimeMinFromMinimum("2026-08", "2026-08-15")).toBeUndefined();
      expect(
        htmlTimeMinFromMinimum("2026-08-15T14:30:00", "   "),
      ).toBeUndefined();
    });
  });

  describe("clampDateTimePartsToMinimum() - 시간 강제 조정(Clamp)", () => {
    it("★ 입력된 시간이 최소 제한 시간보다 과거일 경우, 제한 시간으로 끌어올려 반환한다", () => {
      const minDate = new Date("2026-08-15T10:00:00");
      const result = clampDateTimePartsToMinimum(
        "2026-08-15",
        "09:00",
        minDate,
      );
      expect(result).toEqual({ date: "2026-08-15", time: "10:00" });
    });

    it("★★ 날짜 데이터가 누락되어 병합이 불가능할 경우, 의도치 않은 변형 없이 원본 데이터를 뱉는다", () => {
      const minDate = new Date("2026-08-15T10:00:00");
      const result = clampDateTimePartsToMinimum("", "09:00", minDate);
      expect(result).toEqual({ date: "", time: "09:00" });
    });
  });

  describe("포맷팅 유틸리티 (Date UI Display)", () => {
    it("★ formatDate()는 [M.D (요일)] 포맷을 정확히 반환하며 빈 값을 뱉지 않고 안전하게 처리한다", () => {
      expect(formatDate("")).toBe("");
      expect(formatDate("2026-08-15T10:00:00")).toBe("8.15 (토)");
    });

    it("★★ formatDisplayDate()는 로컬과 CI의 Intl 객체 출력 포맷(오후/PM) 차이를 모두 호환한다", () => {
      const result = formatDisplayDate("2026-08-15T14:30:00");
      expect(result).toContain("8. 15.");
      expect(result).toContain("토");
      expect(result).toMatch(/(오후|PM)\s*2:30/);
    });
  });

  describe("Form Input 연동을 위한 양방향 데이터 포맷팅", () => {
    it("★ displayFromValue() - ISO 문자열을 화면 표시용 'YYYY-MM-DD HH:mm' 형태로 변환한다", () => {
      expect(displayFromValue("2026-08-15T14:30:00")).toBe("2026-08-15 14:30");
      expect(displayFromValue("")).toBe("");
      expect(displayFromValue("invalid")).toBe("invalid");
    });

    it("★ splitDateAndTimeFromValue() - ISO 문자열을 날짜와 시간 객체로 분리한다", () => {
      expect(splitDateAndTimeFromValue("2026-08-15T14:30:00")).toEqual({
        date: "2026-08-15",
        time: "14:30",
      });
      expect(splitDateAndTimeFromValue("invalid")).toEqual({
        date: "",
        time: "",
      });
    });

    it("★ mergeDateAndTimeParts() - 분리된 날짜와 시간 문자열을 ISO 형태로 병합한다", () => {
      expect(mergeDateAndTimeParts("2026-08-15", "14:30")).toContain(
        "2026-08-15T14:30",
      );
      expect(mergeDateAndTimeParts("", "14:30")).toBe("");
    });

    it("★ defaultDatePartForPicker() - 캘린더 피커의 기본값(오늘)을 YYYY-MM-DD 형태로 제공한다", () => {
      expect(defaultDatePartForPicker()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("★ htmlDateOnlyFromLocalPart() - 로컬 날짜 문자열에서 날짜(YYYY-MM-DD) 부분만 안전하게 추출한다", () => {
      expect(htmlDateOnlyFromLocalPart("2026-08-15T14:30")).toBe("2026-08-15");
      expect(htmlDateOnlyFromLocalPart(undefined)).toBeUndefined();
    });

    it("★★ toDatetimeLocalInputValue() - 유효하지 않은 데이터 유입 시 빈 문자열로 초기화하여 폼 에러를 방지한다", () => {
      expect(toDatetimeLocalInputValue("이상한-날짜-데이터")).toBe("");
    });
  });
});
