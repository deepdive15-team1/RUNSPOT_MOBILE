import { Router } from "expo-router";
import { Alert } from "react-native";

import type { NotificationType } from "@/src/types/api/notification";

export interface NotificationRoutePayload {
  type: NotificationType | string;
  sessionId?: string | number | null;
  title?: string;
  body?: string;
}

export const parseString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

export const parseId = (value: unknown): string | number | undefined =>
  typeof value === "string" || typeof value === "number" ? value : undefined;

/**
 * 알림 타입에 따라 적절한 화면으로 라우팅을 처리하는 공통 유틸리티 함수
 * @param payload 알림 데이터 (푸시 알림 페이로드 또는 인앱 알림 아이템)
 * @param router Expo Router 인스턴스 (useRouter()의 반환값)
 */
export const handleNotificationRouting = (
  payload: NotificationRoutePayload,
  router: Router,
) => {
  const { type, title, body, sessionId } = payload;

  const targetSessionId = sessionId ? String(sessionId) : null;

  if (!targetSessionId && type !== "ONE_ON_ONE_CHAT") return;

  switch (type) {
    case "PARTICIPATION_REQUESTED":
      router.push({
        pathname: "/manage-participants",
        params: { id: targetSessionId, title: title ?? "" },
      });
      break;

    case "PARTICIPATION_APPROVED":
      router.push(`/chat/group/${targetSessionId}`);
      break;

    case "PARTICIPATION_REJECTED":
    case "PARTICIPANT_KICKED":
    case "SESSION_START_REMINDER":
      router.push({
        pathname: "/session-detail",
        params: { id: targetSessionId },
      });
      break;

    case "GROUP_CHAT":
      router.push(`/chat/group/${targetSessionId}`);
      break;

    case "ONE_ON_ONE_CHAT":
      router.push(`/chat/private/${targetSessionId}`);
      break;

    case "RUNNING_FINISHED":
      router.push(`/host-rating?sessionId=${targetSessionId}`);
      break;

    case "COMMENT":
      Alert.alert("알림", body ?? "새로운 댓글이 달렸습니다.");
      break;

    default:
      console.warn(`알 수 없는 알림 타입 라우팅 시도: ${type}`);
      break;
  }
};
