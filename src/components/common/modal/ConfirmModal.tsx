import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import {
  colors,
  fontSizes,
  fontWeights,
  spacing,
  borderRadius,
} from "@/src/constants";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean; // API 로딩 중인지 여부 (버튼 중복 클릭 방지)
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onCancel,
  isPending = false,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel} // 안드로이드 뒤로가기 물리 버튼을 눌렀을 때 취소 처리
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={!isPending ? onCancel : undefined}
      >
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1}>
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>{title}</Text>
            {message && <Text style={styles.messageText}>{message}</Text>}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={isPending} // 로딩 중일 때는 취소 못하게 막음
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              disabled={isPending} // 로딩 중일 때 중복 클릭 방지
            >
              {isPending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: colors.bg,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  textContainer: {
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  titleText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.gray800,
    textAlign: "center",
  },
  messageText: {
    fontSize: fontSizes.sm,
    color: colors.error,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.base,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: colors.bg,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.gray600,
  },
  confirmButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
});
