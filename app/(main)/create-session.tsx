import RNSlider from "@react-native-community/slider";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { createSession } from "@/src/api/createSession/createSessionApi.index";
import PinIcon from "@/src/assets/icon/create-session/pin.svg";
import { Input } from "@/src/components/common/Input/Input";
import { Button } from "@/src/components/common/button/Button";
import { DateTimePickerField } from "@/src/components/common/datetime-field";
import { Select } from "@/src/components/common/select";
import { colors, fontSizes, spacing } from "@/src/constants";
import { useCreateSessionDraftStore } from "@/src/stores/createSessionDraftStore";
import type {
  CreateSessionRequest,
  GenderPolicy,
  RunType,
} from "@/src/types/api/createSession";
import { paceStringToSeconds } from "@/src/utils/pace";
import { isEmpty } from "@/src/utils/validation";

const RUN_TYPE_OPTIONS: { value: RunType; label: string }[] = [
  { value: "LSD", label: "장거리 조깅" },
  { value: "INTERVAL", label: "인터벌" },
  { value: "RECOVERY", label: "리커버리 런" },
];

const GENDER_POLICY_OPTIONS: { value: GenderPolicy; label: string }[] = [
  { value: "MALE_ONLY", label: "남성" },
  { value: "FEMALE_ONLY", label: "여성" },
  { value: "MIXED", label: "혼성" },
];

const CAPACITY_MIN = 2;
const CAPACITY_MAX = 10;
const CAPACITY_OPTIONS: { value: string; label: string }[] = Array.from(
  { length: CAPACITY_MAX - CAPACITY_MIN + 1 },
  (_, i) => {
    const n = CAPACITY_MIN + i;
    return { value: String(n), label: `${n}명` };
  },
);

/** 모임 장소·목표 거리 비활성 시 API에 넣을 기본값 (지도 연동 전) */
const DEFAULT_TARGET_DISTANCE_KM = 5;
const DEFAULT_PACE_SEC = 360;
const PACE_SLIDER_MIN = 2 * 60;
const PACE_SLIDER_MAX = 15 * 60;
const PACE_SLIDER_STEP = 30;
/** 일정은 이 시간(밀리초) 이후부터 선택 및 제출 가능 */
const START_AT_MIN_LEAD_MS = 20 * 60 * 1000;

/** 선택 직후 필드 아래에 표시할 일정 오류. 없으면 null */
function validateStartAtTiming(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const start = new Date(trimmed);
  if (Number.isNaN(start.getTime())) {
    return "올바른 형식으로 입력해주세요. (예: 2026-02-10T07:00:00)";
  }
  const now = Date.now();
  if (start.getTime() < now + START_AT_MIN_LEAD_MS) {
    return "일정은 현재 시간으로부터 20분 이후로 설정해 주세요.";
  }
  return null;
}

function secondsToPaceString(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function CreateSessionScreen() {
  const router = useRouter();
  const title = useCreateSessionDraftStore((s) => s.title);
  const locationName = useCreateSessionDraftStore((s) => s.locationName);
  const targetDistanceKm = useCreateSessionDraftStore(
    (s) => s.targetDistanceKm,
  );
  const avgPace = useCreateSessionDraftStore((s) => s.avgPace);
  const startAt = useCreateSessionDraftStore((s) => s.startAt);
  const capacity = useCreateSessionDraftStore((s) => s.capacity);
  const genderPolicy = useCreateSessionDraftStore((s) => s.genderPolicy);
  const runType = useCreateSessionDraftStore((s) => s.runType);
  const locationX = useCreateSessionDraftStore((s) => s.locationX);
  const locationY = useCreateSessionDraftStore((s) => s.locationY);
  const routePolyline = useCreateSessionDraftStore((s) => s.routePolyline);
  const setDraft = useCreateSessionDraftStore((s) => s.setDraft);

  const [error, setError] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paceSecForSlider =
    paceStringToSeconds(avgPace.trim()) ?? DEFAULT_PACE_SEC;
  const paceSliderValue = Math.min(
    PACE_SLIDER_MAX,
    Math.max(PACE_SLIDER_MIN, paceSecForSlider),
  );

  const handleStartAtChange = (isoLocal: string) => {
    setDraft({ startAt: isoLocal });
    const msg = validateStartAtTiming(isoLocal);
    setError((prev) => {
      const next = { ...prev };
      if (msg) next.startAt = msg;
      else delete next.startAt;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const next: Record<string, string> = {};

    if (isEmpty(title.trim())) {
      next.title = "모임 이름을 입력해주세요.";
    }

    const paceSec = paceStringToSeconds(avgPace.trim());
    if (isEmpty(avgPace.trim())) {
      next.avgPace = "평균 페이스를 입력해주세요.";
    } else if (paceSec === null) {
      next.avgPace = "mm:ss 형식으로 입력해주세요. (예: 06:00)";
    }

    if (isEmpty(startAt.trim())) {
      next.startAt = "일정을 입력해주세요.";
    } else {
      const timingErr = validateStartAtTiming(startAt.trim());
      if (timingErr) {
        next.startAt = timingErr;
      }
    }

    const cap = Number(capacity.trim());
    if (
      isEmpty(capacity.trim()) ||
      Number.isNaN(cap) ||
      cap < CAPACITY_MIN ||
      cap > CAPACITY_MAX
    ) {
      next.capacity = `모집 인원을 ${CAPACITY_MIN}명~${CAPACITY_MAX}명 중에서 선택해주세요.`;
    }

    const lon = Number(locationX.trim());
    const lat = Number(locationY.trim());
    if (isEmpty(locationX.trim()) || Number.isNaN(lon)) {
      next.locationX = "러닝 코스: 경도(x)를 숫자로 입력해주세요.";
    } else if (lon < -180 || lon > 180) {
      next.locationX = "경도는 -180~180 사이여야 합니다.";
    }
    if (isEmpty(locationY.trim()) || Number.isNaN(lat)) {
      next.locationY = "러닝 코스: 위도(y)를 숫자로 입력해주세요.";
    } else if (lat < -90 || lat > 90) {
      next.locationY = "위도는 -90~90 사이여야 합니다.";
    }
    if (routePolyline.length < 2) {
      next.routePolyline =
        "러닝 코스 그리기에서 2개 이상의 포인트를 찍어주세요.";
    }

    if (Object.keys(next).length > 0) {
      setError(next);
      return;
    }

    const distParsed = Number(targetDistanceKm.trim());
    const dist =
      Number.isFinite(distParsed) && distParsed > 0
        ? distParsed
        : DEFAULT_TARGET_DISTANCE_KM;

    const requestBody: CreateSessionRequest = {
      title: title.trim(),
      runType: runType as RunType,
      locationName: locationName.trim(),
      locationX: lon,
      locationY: lat,
      routePolyline,
      targetDistanceKm: dist,
      avgPaceSec: paceSec!,
      startAt: startAt.trim(),
      capacity: cap,
      genderPolicy: genderPolicy as GenderPolicy,
    };

    try {
      setIsSubmitting(true);
      setError({});
      await createSession(requestBody);
      useCreateSessionDraftStore.getState().resetDraft();
      router.back();
    } catch (err) {
      const fallback = "세션 개설에 실패했습니다.";
      if (err instanceof AxiosError) {
        const msg = err.response?.data?.message;
        setError((prev) => ({
          ...prev,
          form:
            typeof msg === "string" && msg.trim().length > 0 ? msg : fallback,
        }));
        return;
      }
      setError((prev) => ({ ...prev, form: fallback }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
      >
        <Text style={styles.note}>
          모임 장소·목표 거리는 지도 연동 후 자동 반영 예정이라 현재는 수정할 수
          없습니다. 출발 좌표는 「러닝 코스 그리기」에서 설정해 주세요.
        </Text>

        <View style={styles.formWrap}>
          <Input
            label="모임 이름"
            placeholder="모임 이름을 입력해주세요"
            value={title}
            onChangeText={(v) => setDraft({ title: v })}
            errorMessage={error.title}
          />

          <Select
            label="달리기 종류"
            placeholder="선택해주세요"
            value={runType}
            onChange={(e) =>
              setDraft({ runType: e.target.value as RunType | "" })
            }
            options={RUN_TYPE_OPTIONS}
            error={!!error.runType}
            helperText={error.runType}
          />

          <Input
            label="모임 장소"
            placeholder="모임 장소는 자동으로 설정됩니다."
            startIcon={<PinIcon width={20} height={20} />}
            value={locationName}
            editable={false}
            errorMessage={error.locationName}
          />

          <Input
            label="목표 거리 (km)"
            placeholder="목표거리는 자동으로 설정됩니다."
            value={targetDistanceKm}
            editable={false}
            keyboardType="decimal-pad"
            errorMessage={error.targetDistanceKm}
          />

          <View style={styles.paceField}>
            <View style={styles.paceLabelRow}>
              <Text style={styles.paceLabel}>평균 페이스</Text>
              <Text style={styles.paceValueText}>
                {secondsToPaceString(paceSliderValue)} min/km
              </Text>
            </View>
            <RNSlider
              style={styles.paceSlider}
              minimumValue={PACE_SLIDER_MIN}
              maximumValue={PACE_SLIDER_MAX}
              step={PACE_SLIDER_STEP}
              value={paceSliderValue}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.textSecondary}
              onValueChange={(v) => {
                const snapped =
                  Math.round(v / PACE_SLIDER_STEP) * PACE_SLIDER_STEP;
                const clamped = Math.min(
                  PACE_SLIDER_MAX,
                  Math.max(PACE_SLIDER_MIN, snapped),
                );
                setDraft({ avgPace: secondsToPaceString(clamped) });
              }}
            />
          </View>
          {error.avgPace ? (
            <Text style={styles.fieldError}>{error.avgPace}</Text>
          ) : null}

          <DateTimePickerField
            label="일정"
            placeholder="날짜·시간을 선택해주세요"
            value={startAt}
            onChange={handleStartAtChange}
            errorMessage={error.startAt}
            minimumLeadMs={START_AT_MIN_LEAD_MS}
          />

          <Select
            label="모집 인원"
            placeholder="선택해주세요"
            value={capacity}
            onChange={(e) => setDraft({ capacity: String(e.target.value) })}
            options={CAPACITY_OPTIONS}
            error={!!error.capacity}
            helperText={error.capacity}
          />

          <Select
            label="참여 성별"
            placeholder="선택해주세요"
            value={genderPolicy}
            onChange={(e) =>
              setDraft({ genderPolicy: e.target.value as GenderPolicy | "" })
            }
            options={GENDER_POLICY_OPTIONS}
            error={!!error.genderPolicy}
            helperText={error.genderPolicy}
          />

          <Text style={styles.sectionTitle}>러닝 코스 설정</Text>
          <Text style={styles.sectionHint}>
            「러닝 코스 그리기」에서 좌표를 설정하면 세션 등록 시 최소
            경로(2점)로 반영됩니다.
          </Text>
          <View style={styles.courseActionRow}>
            <Button variant="outline" size="sm" flex disabled>
              러닝 코스 불러오기
            </Button>
            <Button
              variant="outline"
              size="sm"
              flex
              onPress={() => router.push("/(main)/draw-running-course")}
            >
              러닝 코스 그리기
            </Button>
          </View>

          {error.locationX ? (
            <Text style={styles.fieldError}>{error.locationX}</Text>
          ) : null}
          {error.locationY ? (
            <Text style={styles.fieldError}>{error.locationY}</Text>
          ) : null}
          {error.routePolyline ? (
            <Text style={styles.fieldError}>{error.routePolyline}</Text>
          ) : null}

          {error.form ? (
            <Text style={styles.formError}>{error.form}</Text>
          ) : null}

          <Button
            variant="primary"
            size="md"
            fullWidth
            disabled={isSubmitting}
            onPress={handleSubmit}
          >
            {isSubmitting ? "등록 중..." : "세션 등록하기"}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  note: {
    width: "100%",
    maxWidth: 400,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  formWrap: {
    width: "100%",
    maxWidth: 400,
    gap: spacing.base,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.xs,
  },
  sectionHint: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: -spacing.sm,
  },
  courseActionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
  },
  formError: {
    fontSize: fontSizes.sm,
    color: colors.red600,
    textAlign: "center",
  },
  fieldError: {
    fontSize: fontSizes.xs,
    color: colors.red600,
    marginTop: -spacing.sm,
    marginLeft: spacing.xs,
  },
  paceField: {
    width: "100%",
    gap: spacing.sm,
  },
  paceLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  paceLabel: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.text,
  },
  paceValueText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  paceSlider: {
    width: "100%",
    height: 40,
  },
});
