import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Button } from "@/src/components/common/button/Button";
import { colors, fontSizes, fontWeights, spacing } from "@/src/constants";
import { ReportReasonCode } from "@/src/types/api/report";

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reasonCode: ReportReasonCode, detail: string) => void;
  targetName?: string;
}

const REPORT_REASONS: { label: string; code: ReportReasonCode }[] = [
  { label: "스팸 및 홍보성 내용", code: "SPAM" },
  { label: "욕설 및 불쾌한 표현", code: "ABUSE" },
  { label: "음란물 및 부적절한 콘텐츠", code: "SEXUAL" },
  { label: "사기 및 허위 정보", code: "FRAUD" },
  { label: "기타 (직접 입력)", code: "ETC" },
];

export function ReportModal({
  visible,
  onClose,
  onSubmit,
  targetName,
}: ReportModalProps) {
  const [selectedCode, setSelectedCode] = useState<ReportReasonCode | null>(
    null,
  );
  const [details, setDetails] = useState("");

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSelectedCode(null);
      setDetails("");
    }, 300);
  };

  const handleSubmit = () => {
    if (!selectedCode) return;

    const selectedLabel = REPORT_REASONS.find(
      (r) => r.code === selectedCode,
    )?.label;
    const finalDetail = details.trim()
      ? `[${selectedLabel}] ${details}`
      : `[${selectedLabel}]`;

    onSubmit(selectedCode, finalDetail);

    setTimeout(() => {
      setSelectedCode(null);
      setDetails("");
    }, 300);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>신고하기</Text>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.gray600} />
            </Pressable>
          </View>

          {targetName && (
            <Text style={styles.subtitle}>
              <Text style={{ fontWeight: fontWeights.bold }}>{targetName}</Text>
              님을 신고하는 이유를 선택해주세요.
            </Text>
          )}

          {/* 사유 선택 리스트 */}
          <View style={styles.reasonList}>
            {REPORT_REASONS.map((item) => (
              <Pressable
                key={item.code}
                style={styles.reasonRow}
                onPress={() => setSelectedCode(item.code)}
              >
                <Ionicons
                  name={
                    selectedCode === item.code
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={
                    selectedCode === item.code ? colors.main : colors.gray400
                  }
                />
                <Text
                  style={[
                    styles.reasonText,
                    selectedCode === item.code && styles.reasonTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedCode === "ETC" && (
            <TextInput
              style={styles.detailsInput}
              placeholder="신고 사유를 상세히 적어주세요. (최대 100자)"
              placeholderTextColor={colors.gray400}
              multiline
              maxLength={100}
              value={details}
              onChangeText={setDetails}
            />
          )}

          <Button
            variant="primary"
            fullWidth
            disabled={
              !selectedCode || (selectedCode === "ETC" && !details.trim())
            }
            onPress={handleSubmit}
            wrapperStyle={{ marginTop: spacing.md }}
          >
            신고 접수
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 40 : spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.gray600,
    marginBottom: spacing.md,
  },
  reasonList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  reasonText: {
    fontSize: fontSizes.base,
    color: colors.gray800,
  },
  reasonTextSelected: {
    color: colors.main,
    fontWeight: fontWeights.semibold,
  },
  detailsInput: {
    backgroundColor: colors.gray100,
    borderRadius: 8,
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: fontSizes.sm,
    color: colors.text,
    marginBottom: spacing.md,
  },
});
