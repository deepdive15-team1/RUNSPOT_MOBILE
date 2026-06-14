import type { StyleProp, ViewStyle } from "react-native";

import type {
  SizeType,
  VariantType,
} from "@/src/components/common/Input/Input.styles";

export interface DateTimePickerFieldProps {
  label?: string;
  value: string;
  onChange: (isoLocal: string) => void;
  placeholder?: string;
  errorMessage?: string;
  disabled?: boolean;
  variant?: VariantType;
  size?: SizeType;
  fullWidth?: boolean;
  minimumDate?: Date;
  /** 지금부터 최소 이 시간(밀리초) 이후만 선택. `minimumDate`와 병합 시 더 늦은 쪽 적용 */
  minimumLeadMs?: number;
  maximumDate?: Date;
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;
  containerStyle?: StyleProp<ViewStyle>;
  /** 모달 제목 (null이면 제목 없음) — 네이티브 전용 */
  modalTitle?: string | null;
}

/** 피커 최소 시각: `minimumDate`와 `지금+minimumLeadMs` 중 더 늦은 값 */
export function resolveEffectiveMinimumDate(
  minimumDate: Date | undefined,
  minimumLeadMs: number | undefined,
): Date | undefined {
  const leadMs = minimumLeadMs ?? 0;
  const leadFloor = new Date(Date.now() + leadMs);
  if (!minimumDate || Number.isNaN(minimumDate.getTime())) {
    if (leadMs > 0) return leadFloor;
    return undefined;
  }
  if (leadMs <= 0) return minimumDate;
  return minimumDate.getTime() > leadFloor.getTime() ? minimumDate : leadFloor;
}

export function formatLocalIsoDateTime(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}:${s}`;
}

export function parseValueToDate(value: string): Date {
  const trimmed = value.trim();
  if (!trimmed) return new Date();
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function displayFromValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return trimmed;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${h}:${min}`;
}

/** HTML datetime-local value (분 단위) */
export function toDatetimeLocalInputValue(isoLocal: string): string {
  const trimmed = isoLocal.trim();
  if (!trimmed) return "";
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

export function fromDatetimeLocalInputValue(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return trimmed;
  return formatLocalIsoDateTime(d);
}

export function dateToDatetimeLocalMinMax(
  d: Date | undefined,
): string | undefined {
  if (!d || Number.isNaN(d.getTime())) return undefined;
  return toDatetimeLocalInputValue(formatLocalIsoDateTime(d));
}

/** HTML `type="date"` / `type="time"` 분리 (값 없으면 빈 문자열) */
export function splitDateAndTimeFromValue(isoLocal: string): {
  date: string;
  time: string;
} {
  const v = toDatetimeLocalInputValue(isoLocal);
  if (!v || !v.includes("T")) return { date: "", time: "" };
  const [d, t] = v.split("T");
  return { date: d ?? "", time: (t ?? "").slice(0, 5) };
}

export function mergeDateAndTimeParts(date: string, time: string): string {
  const d = date.trim();
  const t = (time.trim() || "00:00").slice(0, 5);
  if (!d) return "";
  return fromDatetimeLocalInputValue(`${d}T${t}`);
}

/** 빈 값일 때 날짜 필드 기본값 (오늘, 로컬) */
export function defaultDatePartForPicker(): string {
  return toDatetimeLocalInputValue(formatLocalIsoDateTime(new Date())).slice(
    0,
    10,
  );
}

/** `YYYY-MM-DDTHH:mm` → 날짜 input용 `min`/`max` */
export function htmlDateOnlyFromLocalPart(
  localPart: string | undefined,
): string | undefined {
  if (!localPart || localPart.length < 10) return undefined;
  return localPart.slice(0, 10);
}

/** `type="time"`용 `min`(HH:mm). 선택한 날짜가 최소 일시와 같은 날일 때만 제한. */
export function htmlTimeMinFromMinimum(
  minLocalPart: string | undefined,
  draftDate: string,
): string | undefined {
  if (!minLocalPart || minLocalPart.length < 16 || !draftDate.trim()) {
    return undefined;
  }
  const minDay = minLocalPart.slice(0, 10);
  if (draftDate.trim() !== minDay) return undefined;
  return minLocalPart.slice(11, 16);
}

/** 날짜·시간 문자열 부분을 `minimumDate` 이상으로 맞춤 */
export function clampDateTimePartsToMinimum(
  date: string,
  time: string,
  minimumDate: Date | undefined,
): { date: string; time: string } {
  if (!minimumDate || Number.isNaN(minimumDate.getTime())) {
    return { date, time };
  }
  const merged = mergeDateAndTimeParts(date, time);
  if (!merged) return { date, time };
  const t = new Date(merged).getTime();
  if (Number.isNaN(t) || t >= minimumDate.getTime()) {
    return { date, time };
  }
  const local = toDatetimeLocalInputValue(formatLocalIsoDateTime(minimumDate));
  if (!local || !local.includes("T")) return { date, time };
  const [d, tm] = local.split("T");
  return { date: d ?? date, time: (tm ?? time).slice(0, 5) };
}
