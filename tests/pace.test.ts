import {
  formatPaceDisplay,
  paceStringToSeconds,
  secondsToPaceString,
} from "@/src/utils/pace";

/**
 * ⚠️ 아래 describe 블록 중 "현재 실패" 표시가 붙은 것은 의도된 실패다.
 *    main 브랜치의 실제 결함을 고정한 것이고, 수정 전까지 빨간불이어야 한다.
 */

describe("paceStringToSeconds — 정상 케이스", () => {
  it.each([
    ["06:00", 360],
    ["02:00", 120],
    ["15:00", 900],
    ["05:59", 359],
    ["  06 : 00  ", 360], // 공백은 제거 스펙
  ])("%s → %s초", (input, expected) => {
    expect(paceStringToSeconds(input)).toBe(expected);
  });
});

describe("paceStringToSeconds — 거부해야 하는 입력", () => {
  it.each([":30", "0530", "06", "", "abc", "06:00:00", "05:60", "05:99"])(
    "%s → null",
    (input) => {
      expect(paceStringToSeconds(input)).toBeNull();
    },
  );
});

describe("paceStringToSeconds — 현재 실패 ★★ (실제 결함)", () => {
  // parseInt 가 "5abc" 를 5 로 읽는다
  it("영숫자 혼합을 거부한다", () => {
    expect(paceStringToSeconds("5abc:30")).toBeNull(); // 현재 330
  });

  // 분(min)에 하한 검사가 없다 → 음수 페이스가 서버로 나간다
  it("음수 분을 거부한다", () => {
    expect(paceStringToSeconds("-01:30")).toBeNull(); // 현재 -30
  });

  // 0초/km 페이스는 물리적으로 불가능
  it("0 페이스를 거부한다", () => {
    expect(paceStringToSeconds("0:0")).toBeNull(); // 현재 0
  });

  // "05:5" 는 5분 5초인가 5분 50초인가? 모호하면 거부해야 한다
  it("초가 2자리가 아니면 거부한다", () => {
    expect(paceStringToSeconds("05:5")).toBeNull(); // 현재 305
  });

  // 러닝 페이스로 성립하는 범위 밖
  it("현실적인 범위(2:00~15:00) 밖을 거부한다", () => {
    expect(paceStringToSeconds("99:59")).toBeNull(); // 현재 5999
    expect(paceStringToSeconds("01:00")).toBeNull(); // 현재 60
  });
});

describe("secondsToPaceString", () => {
  it.each([
    [360, "06:00"],
    [120, "02:00"],
    [359, "05:59"],
  ])("%s초 → %s", (input, expected) => {
    expect(secondsToPaceString(input)).toBe(expected);
  });

  // 현재 실패: "-1:-30" 이라는 말이 안 되는 문자열이 나온다
  it("음수 입력을 방어한다 ★", () => {
    expect(() => secondsToPaceString(-30)).toThrow();
  });
});

describe("왕복 성질", () => {
  it("120~900초 전 구간에서 파싱↔포맷이 항등이다", () => {
    for (let s = 120; s <= 900; s += 1) {
      expect(paceStringToSeconds(secondsToPaceString(s))).toBe(s);
    }
  });
});

describe("formatPaceDisplay — 입력 중 표시", () => {
  it.each([
    ["", ""],
    ["0", "0"],
    ["05", "05:"],
    ["053", "05:3"],
    ["0530", "05:30"],
    ["05:30", "05:30"],
    ["053099", "05:30"], // 4자리 초과 절삭
    ["a5b3c0", "53:0"], // 숫자만 추출 → "530" → 53:0
  ])("%s → %s", (input, expected) => {
    expect(formatPaceDisplay(input)).toBe(expected);
  });
});
