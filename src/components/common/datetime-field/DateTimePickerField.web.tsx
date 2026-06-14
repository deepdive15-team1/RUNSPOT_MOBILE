import { useState, type CSSProperties } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  errorVariants,
  inputSizes,
  inputStyles,
  wrapperSizes,
  wrapperVariants,
} from "@/src/components/common/Input/Input.styles";
import {
  borderRadius,
  colors,
  fontSizes,
  fontWeights,
  spacing,
  theme,
  zIndex,
} from "@/src/constants";
import {
  type DateTimePickerFieldProps,
  clampDateTimePartsToMinimum,
  dateToDatetimeLocalMinMax,
  defaultDatePartForPicker,
  displayFromValue,
  formatLocalIsoDateTime,
  htmlDateOnlyFromLocalPart,
  htmlTimeMinFromMinimum,
  mergeDateAndTimeParts,
  resolveEffectiveMinimumDate,
  splitDateAndTimeFromValue,
  toDatetimeLocalInputValue,
} from "@/src/utils/datetime";

const WEB_INPUT_FONT = theme.fontSizes.sm;
const CONFIRM_LABEL = "선택 완료";
const CANCEL_LABEL = "취소";

export function DateTimePickerField({
  label,
  value,
  onChange,
  placeholder = "날짜·시간을 선택해주세요",
  errorMessage,
  disabled = false,
  variant = "primary",
  size = "md",
  fullWidth = true,
  minimumDate,
  minimumLeadMs,
  maximumDate,
  containerStyle,
}: DateTimePickerFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [draftDate, setDraftDate] = useState("");
  const [draftTime, setDraftTime] = useState("");

  const effectiveMinimumDate = resolveEffectiveMinimumDate(
    minimumDate,
    minimumLeadMs,
  );

  const minLocal = dateToDatetimeLocalMinMax(effectiveMinimumDate);
  const maxLocal = dateToDatetimeLocalMinMax(maximumDate);
  const minDateOnly = htmlDateOnlyFromLocalPart(minLocal);
  const maxDateOnly = htmlDateOnlyFromLocalPart(maxLocal);

  const displayText = displayFromValue(value);
  const showPlaceholder = !displayText;

  const leadMinutesForHint =
    minimumLeadMs != null && minimumLeadMs > 0
      ? Math.max(1, Math.round(minimumLeadMs / 60000))
      : 0;

  const fontSize = inputSizes[size].fontSize ?? WEB_INPUT_FONT;

  const domInputStyle: CSSProperties = {
    width: "100%",
    minHeight: 44,
    margin: 0,
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.gray200,
    borderRadius: borderRadius.base,
    fontSize,
    color: theme.colors.text,
    boxSizing: "border-box",
    backgroundColor: colors.white,
  };

  const openModal = () => {
    if (disabled) return;
    const { date, time } = splitDateAndTimeFromValue(value);
    if (effectiveMinimumDate) {
      const minD = effectiveMinimumDate;
      if (date && time) {
        const clamped = clampDateTimePartsToMinimum(date, time, minD);
        setDraftDate(clamped.date);
        setDraftTime(clamped.time);
      } else {
        const today = defaultDatePartForPicker();
        const openingMinLocal = toDatetimeLocalInputValue(
          formatLocalIsoDateTime(minD),
        );
        const minDay = openingMinLocal.slice(0, 10);
        const minTime = openingMinLocal.slice(11, 16);
        setDraftDate(today);
        setDraftTime(today === minDay ? minTime : "12:00");
      }
    } else if (date && time) {
      setDraftDate(date);
      setDraftTime(time);
    } else {
      setDraftDate(defaultDatePartForPicker());
      setDraftTime("12:00");
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const mergedDraft = mergeDateAndTimeParts(draftDate, draftTime);
  const mergedMs = mergedDraft ? new Date(mergedDraft).getTime() : NaN;
  const minMs = effectiveMinimumDate?.getTime();
  const isBeforeMinimum =
    effectiveMinimumDate != null &&
    Number.isFinite(minMs) &&
    Number.isFinite(mergedMs) &&
    mergedMs < (minMs as number);

  const canCommit =
    Boolean(draftDate.trim()) && Boolean(draftTime.trim()) && !isBeforeMinimum;

  const timeInputMin = htmlTimeMinFromMinimum(minLocal, draftDate);

  const domTimeInputStyle: CSSProperties = {
    ...domInputStyle,
    color:
      timeInputMin != null || isBeforeMinimum
        ? colors.gray500
        : theme.colors.text,
  };

  const commitSelection = () => {
    if (!canCommit) return;
    const clamped = clampDateTimePartsToMinimum(
      draftDate,
      draftTime,
      effectiveMinimumDate,
    );
    const merged = mergeDateAndTimeParts(clamped.date, clamped.time);
    if (!merged) return;
    onChange(merged);
    closeModal();
  };

  return (
    <View
      style={[
        inputStyles.wrapper,
        fullWidth ? { width: "100%" } : { width: "auto" },
        containerStyle,
      ]}
    >
      {label ? <Text style={inputStyles.label}>{label}</Text> : null}

      <TouchableOpacity
        activeOpacity={0.85}
        disabled={disabled}
        onPress={openModal}
        style={[
          inputStyles.inputContainer,
          wrapperSizes[size],
          wrapperVariants[variant],
          errorMessage ? errorVariants[variant] : null,
          disabled ? inputStyles.disabledContainer : null,
        ]}
      >
        <Text
          style={[
            inputStyles.input,
            inputSizes[size],
            showPlaceholder && styles.placeholder,
          ]}
          numberOfLines={1}
        >
          {showPlaceholder ? placeholder : displayText}
        </Text>
      </TouchableOpacity>

      {errorMessage ? (
        <Text style={inputStyles.errorMessage}>{errorMessage}</Text>
      ) : null}

      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={closeModal} />
          <View
            style={[styles.sheet, { boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }]}
          >
            <Text style={styles.sheetTitle}>{label ?? "날짜·시간 선택"}</Text>

            <Text style={styles.hint}>
              {leadMinutesForHint > 0 ? (
                <>
                  일정은{" "}
                  <Text style={styles.hintEmphasis}>
                    현재 시간으로부터 {leadMinutesForHint}분 이후
                  </Text>
                  부터 선택할 수 있습니다.{" "}
                </>
              ) : null}
              달력·시간을 고른 뒤 아래 「{CONFIRM_LABEL}」을 눌러 주세요.
            </Text>

            <View style={styles.pickerRow}>
              <View style={styles.pickerCol}>
                <Text style={styles.fieldLabel}>날짜</Text>
                <input
                  type="date"
                  aria-label="날짜"
                  min={minDateOnly}
                  max={maxDateOnly}
                  value={draftDate}
                  onChange={(e) => {
                    const next = e.currentTarget.value;
                    setDraftDate(next);
                    setDraftTime(
                      (prev) =>
                        clampDateTimePartsToMinimum(
                          next,
                          prev,
                          effectiveMinimumDate,
                        ).time,
                    );
                  }}
                  style={domInputStyle}
                />
              </View>
              <View style={styles.pickerCol}>
                <Text style={styles.fieldLabel}>시간</Text>
                <input
                  type="time"
                  aria-label="시간"
                  step={60}
                  min={timeInputMin}
                  value={draftTime}
                  onChange={(e) => {
                    const next = e.currentTarget.value;
                    setDraftTime(
                      clampDateTimePartsToMinimum(
                        draftDate,
                        next,
                        effectiveMinimumDate,
                      ).time,
                    );
                  }}
                  style={domTimeInputStyle}
                />
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnGhost]}
                onPress={closeModal}
                accessibilityRole="button"
              >
                <Text style={styles.actionGhostText}>{CANCEL_LABEL}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  styles.actionBtnPrimary,
                  !canCommit && styles.actionBtnDisabled,
                ]}
                onPress={commitSelection}
                disabled={!canCommit}
                accessibilityRole="button"
              >
                <Text style={styles.actionPrimaryText}>{CONFIRM_LABEL}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    color: theme.colors.gray400,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.base,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: zIndex.overlay,
  },
  sheet: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    gap: spacing.md,
    zIndex: zIndex.modal,
  },
  sheetTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  hint: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: -spacing.xs,
  },
  hintEmphasis: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: colors.main,
    lineHeight: 18,
  },
  pickerRow: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
    alignItems: "flex-start",
  },
  pickerCol: {
    flex: 1,
    minWidth: 0,
  },
  fieldLabel: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.base,
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnGhost: {
    backgroundColor: colors.gray100,
  },
  actionBtnPrimary: {
    backgroundColor: colors.main,
  },
  actionBtnDisabled: {
    opacity: 0.45,
  },
  actionGhostText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.gray700,
  },
  actionPrimaryText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.white,
  },
});
