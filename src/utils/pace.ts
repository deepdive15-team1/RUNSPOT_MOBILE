/** "mm:ss" 문자열을 초 단위로 변환
 *  잘못된 형식일 경우 null
 */
export function paceStringToSeconds(value: string): number | null {
  const trimmed = value.trim().replace(/\s/g, "");
  const parts = trimmed.split(":");
  if (parts.length !== 2) return null;

  const min = parseInt(parts[0], 10);
  const sec = parseInt(parts[1], 10);
  if (!Number.isInteger(min) || !Number.isInteger(sec)) return null;
  if (sec < 0 || sec > 59) return null;
  return min * 60 + sec;
}

/** 초 단위 숫자를 "mm:ss" 문자열로 변환 */
export function secondsToPaceString(totalSeconds: number): string {
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/**
 * 숫자만 추출해 최대 4자리로 자른 뒤, 2자리일 때는 "05:", 3자리 이상일 때는 "05:3", "05:30" 형태로 반환.
 * @example formatPaceDisplay("05") => "05:", formatPaceDisplay("0530") => "05:30"
 */
export function formatPaceDisplay(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 1) return digits;
  if (digits.length === 2) return `${digits}:`;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function formatStartAt(isoString: string): string {
  const d = new Date(isoString);
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}
