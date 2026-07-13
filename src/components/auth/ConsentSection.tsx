import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Checkbox } from "@/src/components/common/checkbox";
import {
  borderRadius,
  colors,
  fontSizes,
  fontWeights,
  spacing,
} from "@/src/constants";
import { PRIVACY_COLLECTION_SUMMARY } from "@/src/constants/legal";

export interface ConsentState {
  termsAgreed: boolean;
  privacyAgreed: boolean;
}

interface ConsentSectionProps {
  value: ConsentState;
  onChange: (next: ConsentState) => void;
  errorMessage?: string;
}

export function ConsentSection({
  value,
  onChange,
  errorMessage,
}: ConsentSectionProps) {
  const router = useRouter();
  const allChecked = value.termsAgreed && value.privacyAgreed;
  const showError = !!errorMessage;

  const setAll = (checked: boolean) => {
    onChange({ termsAgreed: checked, privacyAgreed: checked });
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>개인정보 수집·이용 안내</Text>
      <Text style={styles.notice}>
        회원가입을 위해 아래 개인정보를 수집·이용합니다. 동의하지 않으실 경우
        서비스 이용이 제한될 수 있습니다.
      </Text>

      <View style={styles.summaryCard}>
        <SummaryRow
          label="수집 항목"
          value={PRIVACY_COLLECTION_SUMMARY.items}
        />
        <SummaryRow
          label="수집 목적"
          value={PRIVACY_COLLECTION_SUMMARY.purpose}
        />
        <SummaryRow
          label="보유 기간"
          value={PRIVACY_COLLECTION_SUMMARY.retention}
        />
      </View>

      <View style={styles.checkboxGroup}>
        <Checkbox
          checked={allChecked}
          onChange={setAll}
          label={<Text style={styles.allLabel}>약관 전체 동의</Text>}
          error={showError && !allChecked}
          accessibilityLabel="약관 전체 동의"
        />

        <View style={styles.divider} />

        <Checkbox
          checked={value.termsAgreed}
          onChange={(checked) => onChange({ ...value, termsAgreed: checked })}
          label={
            <Text style={styles.itemLabel}>
              <Text style={styles.required}>[필수]</Text> 서비스 이용약관 동의
            </Text>
          }
          error={showError && !value.termsAgreed}
          accessibilityLabel="서비스 이용약관 동의"
          endAdornment={
            <Pressable
              onPress={() => router.push("/terms")}
              hitSlop={8}
              accessibilityRole="link"
            >
              <Text style={styles.viewLink}>보기</Text>
            </Pressable>
          }
        />

        <Checkbox
          checked={value.privacyAgreed}
          onChange={(checked) => onChange({ ...value, privacyAgreed: checked })}
          label={
            <Text style={styles.itemLabel}>
              <Text style={styles.required}>[필수]</Text> 개인정보 수집·이용
              동의
            </Text>
          }
          error={showError && !value.privacyAgreed}
          accessibilityLabel="개인정보 수집·이용 동의"
          endAdornment={
            <Pressable
              onPress={() => router.push("/privacy")}
              hitSlop={8}
              accessibilityRole="link"
            >
              <Text style={styles.viewLink}>보기</Text>
            </Pressable>
          }
        />
      </View>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.gray900,
  },
  notice: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    color: colors.gray600,
    lineHeight: 18,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryRow: {
    gap: spacing.xxs,
  },
  summaryLabel: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.gray700,
  },
  summaryValue: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    color: colors.gray600,
    lineHeight: 18,
  },
  checkboxGroup: {
    marginTop: spacing.xs,
    gap: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  allLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.gray900,
    lineHeight: 20,
  },
  itemLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.gray800,
    lineHeight: 20,
  },
  required: {
    color: colors.main,
    fontWeight: fontWeights.semibold,
  },
  viewLink: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.main,
    paddingTop: 2,
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.error,
  },
});
