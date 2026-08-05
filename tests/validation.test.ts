import {
  areEqual,
  isEmpty,
  isInRange1To7,
  isValidPassword,
  matchAlphaNum,
} from "@/src/utils/validation";

describe("isEmpty", () => {
  it.each([null, "", "   ", "\t\n"])("%p → true", (v) => {
    expect(isEmpty(v)).toBe(true);
  });

  it.each([0, false, "a", [], {}])("%p → false", (v) => {
    expect(isEmpty(v)).toBe(false);
  });

  // ★ 현재 실패: 이름과 달리 undefined 를 "비어있지 않다"고 판정한다.
  // 지금은 호출부가 전부 .trim() 을 걸어 넘겨서 안 터지지만,
  // API 응답의 undefined 를 그대로 넣는 호출부가 하나만 생기면 검증이 통째로 뚫린다.
  it("undefined → true ★", () => {
    expect(isEmpty(undefined)).toBe(true);
  });
});

describe("matchAlphaNum", () => {
  it.each([
    ["abc123", 4, undefined, true],
    ["ab", 4, undefined, false],
    ["abc123", 1, 5, false],
    ["abc 123", 1, undefined, false],
    ["한글", 1, undefined, false],
    ["abc-123", 1, undefined, false],
    ["  abc123  ", 6, undefined, true],
  ])("(%s, %s, %s) → %s", (v, min, max, expected) => {
    expect(
      matchAlphaNum(v as string, min as number, max as number | undefined),
    ).toBe(expected);
  });

  it("빈 문자열은 minLen 0 이어도 false (패턴이 + 라서)", () => {
    expect(matchAlphaNum("", 0)).toBe(false);
  });
});

describe("isValidPassword", () => {
  it.each([
    ["password", 8, false],
    ["12345678", 8, false],
    ["pass1234", 8, true],
    ["a1!@#$%^", 8, true],
    ["a1", 8, false],
  ])("(%s, %s) → %s", (v, min, expected) => {
    expect(isValidPassword(v as string, min as number)).toBe(expected);
  });

  it("공백만으로 길이를 채울 수 없다", () => {
    expect(isValidPassword("a1      ", 8)).toBe(false);
  });
});

describe("isInRange1To7 — 스펙 확정 필요 ★", () => {
  it.each([
    [1, true],
    [7, true],
    [0, false],
    [8, false],
    [3.5, false],
    ["", false],
    [null, false],
  ])("%p → %s", (v, expected) => {
    expect(isInRange1To7(v)).toBe(expected);
  });

  // Number(" 3 ") === 3, Number("3.0") === 3 이라 통과한다.
  // 주간 러닝 횟수 입력에 쓰이므로 문자열을 어디까지 허용할지 정하고 여기에 못 박는다.
  it("문자열 입력 허용 범위", () => {
    expect(isInRange1To7(" 3 ")).toBe(true);
    expect(isInRange1To7("3.0")).toBe(true);
    expect(isInRange1To7("3abc")).toBe(false);
  });
});

describe("areEqual", () => {
  it.each([
    ["a", "a", true],
    [" a ", "a", true],
    [null, "", true],
    [undefined, "", true],
    [1, "1", true],
    ["a", "b", false],
  ])("(%p, %p) → %s", (a, b, expected) => {
    expect(areEqual(a, b)).toBe(expected);
  });

  it("trim=false 면 공백을 구분한다", () => {
    expect(areEqual(" a ", "a", false)).toBe(false);
  });
});
