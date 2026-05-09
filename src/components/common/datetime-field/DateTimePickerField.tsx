import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DatePicker from "react-native-date-picker";

import {
  errorVariants,
  inputSizes,
  inputStyles,
  wrapperSizes,
  wrapperVariants,
} from "@/src/components/common/Input/Input.styles";
import { theme } from "@/src/constants";
import {
  type DateTimePickerFieldProps,
  displayFromValue,
  formatLocalIsoDateTime,
  parseValueToDate,
  resolveEffectiveMinimumDate,
} from "@/src/utils/datetime";

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
  minuteInterval = 1,
  containerStyle,
  modalTitle,
}: DateTimePickerFieldProps) {
  const [open, setOpen] = useState(false);

  const effectiveMinimumDate = resolveEffectiveMinimumDate(
    minimumDate,
    minimumLeadMs,
  );
  const rawPickerDate = parseValueToDate(value);
  const pickerDate =
    effectiveMinimumDate &&
    !Number.isNaN(effectiveMinimumDate.getTime()) &&
    rawPickerDate.getTime() < effectiveMinimumDate.getTime()
      ? effectiveMinimumDate
      : rawPickerDate;

  const displayText = displayFromValue(value);
  const showPlaceholder = !displayText;

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
        onPress={() => setOpen(true)}
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

      <DatePicker
        modal
        open={open}
        date={pickerDate}
        mode="datetime"
        locale="ko"
        minuteInterval={minuteInterval}
        minimumDate={effectiveMinimumDate}
        maximumDate={maximumDate}
        onConfirm={(d) => {
          setOpen(false);
          onChange(formatLocalIsoDateTime(d));
        }}
        onCancel={() => setOpen(false)}
        title={modalTitle === undefined ? (label ?? "일정") : modalTitle}
        confirmText="선택 완료"
        cancelText="취소"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    color: theme.colors.gray400,
  },
});
