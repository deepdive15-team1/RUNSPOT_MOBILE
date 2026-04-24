/** 빈 값 여부 */
export function isEmpty(value: unknown): boolean {
  if (value === null) return true;
  if (typeof value === "string") {
    return value.trim().length === 0;
  }
  return false;
}

/** 두 값 동일 여부 */
export function areEqual(a: unknown, b: unknown, trim = true): boolean {
  const stringA = String(a ?? "");
  const stringB = String(b ?? "");
  return trim ? stringA.trim() === stringB.trim() : stringA === stringB;
}

/** 1 ~ 7 사이 숫자 */
export function isInRange1To7(value: unknown): boolean {
  const num = Number(value);
  return Number.isInteger(num) && num >= 1 && num <= 7;
}

/** 영문&숫자 조합 + 길이 검사
 * @param minLen - 최소 길이
 * @param maxLen - 최대 길이(선택)
 */
export function matchAlphaNum(
  value: string,
  minLen: number,
  maxLen?: number,
): boolean {
  const trimmed = value.trim();
  const lengthOk =
    trimmed.length >= minLen && (maxLen == null || trimmed.length <= maxLen);
  const patternOk = /^[a-zA-Z0-9]+$/.test(trimmed);
  return lengthOk && patternOk;
}

/** 비밀번호: 최소 길이 + 영문·숫자 각 1자 이상 (특수문자 허용) */
export function isValidPassword(value: string, minLen: number): boolean {
  const trimmed = value.trim();
  if (trimmed.length < minLen) return false;
  return /[a-zA-Z]/.test(trimmed) && /\d/.test(trimmed);
}
