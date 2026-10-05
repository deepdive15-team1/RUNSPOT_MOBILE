import type {
  NotificationListResponse,
  UnreadCountResponse,
  PushTokenRequest,
} from "@/src/types/api/notification";

export const MOCK_NOTIFICATIONS: NotificationListResponse = {
  notifications: [
    {
      id: 106,
      type: "PARTICIPATION_REQUESTED",
      title: "새로운 참여 요청",
      body: "초보러너님이 여의도 야간 러닝에 참여를 신청했습니다.",
      actor: { id: 5, name: "초보러너", profileImageUrl: null },
      sessionId: 10,
      participationId: 50,
      actionType: "APPROVE_OR_REJECT",
      actionStatus: "PENDING",
      read: false,
      readAt: null,
      createdAt: "2026-09-14T14:30:00",
    },
    {
      id: 105,
      type: "PARTICIPATION_REQUESTED",
      title: "참여 요청 상태 안내",
      body: "프로러너님의 참여 요청이 처리되었습니다.",
      actor: { id: 6, name: "프로러너", profileImageUrl: null },
      sessionId: 10,
      participationId: 51,
      actionType: "APPROVE_OR_REJECT",
      actionStatus: "RESOLVED",
      read: true,
      readAt: "2026-09-14T13:00:00",
      createdAt: "2026-09-14T12:00:00",
    },
    {
      id: 104,
      type: "PARTICIPATION_APPROVED",
      title: "참여 승인 완료",
      body: "호스트님이 잠수교 업힐 훈련 참여를 수락했습니다.",
      actor: { id: 2, name: "호스트", profileImageUrl: null },
      sessionId: 11,
      participationId: 52,
      actionType: "NAVIGATE",
      actionStatus: "NONE",
      read: false,
      readAt: null,
      createdAt: "2026-09-13T18:00:00",
    },
    {
      id: 103,
      type: "PARTICIPATION_REJECTED",
      title: "참여 거절 안내",
      body: "아쉽지만 석촌호수 조깅 참여가 거절되었습니다.",
      actor: { id: 3, name: "석촌호랑이", profileImageUrl: null },
      sessionId: 12,
      participationId: 53,
      actionType: "NAVIGATE",
      actionStatus: "NONE",
      read: true,
      readAt: "2026-09-12T10:00:00",
      createdAt: "2026-09-12T09:30:00",
    },
    {
      id: 102,
      type: "PARTICIPANT_KICKED",
      title: "모임에서 제외됨",
      body: "올림픽공원 인터벌 모임에서 퇴장되었습니다.",
      actor: { id: 4, name: "코치러너", profileImageUrl: null },
      sessionId: 13,
      participationId: 54,
      actionType: "NAVIGATE",
      actionStatus: "NONE",
      read: false,
      readAt: null,
      createdAt: "2026-09-11T15:00:00",
    },
    {
      id: 101,
      type: "SESSION_START_REMINDER",
      title: "러닝 시작 알림",
      body: "남산 러닝이 30분 후 시작됩니다.",
      actor: null,
      sessionId: 14,
      participationId: null,
      actionType: "NAVIGATE",
      actionStatus: "NONE",
      read: true,
      readAt: "2026-09-10T08:35:00",
      createdAt: "2026-09-10T08:30:00",
    },
  ],
  nextCursorId: 100,
  hasNext: true,
};

export const getNotifications = async (
  cursorId?: number,
  size = 20,
  unreadOnly = false,
): Promise<NotificationListResponse> => {
  const filtered = MOCK_NOTIFICATIONS.notifications.filter(
    (notification) =>
      (!unreadOnly || !notification.read) &&
      (cursorId === undefined || notification.id < cursorId),
  );
  const notifications = filtered.slice(0, size);
  const hasNext = filtered.length > notifications.length;
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          notifications,
          hasNext,
          nextCursorId: hasNext
            ? (notifications[notifications.length - 1]?.id ?? null)
            : null,
        }),
      500,
    ),
  );
};

export const readNotification = async (
  notificationId: number,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  MOCK_NOTIFICATIONS.notifications = MOCK_NOTIFICATIONS.notifications.map(
    (notification) =>
      notification.id === notificationId
        ? { ...notification, read: true, readAt: new Date().toISOString() }
        : notification,
  );
};

export const readAllNotifications = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  MOCK_NOTIFICATIONS.notifications = MOCK_NOTIFICATIONS.notifications.map(
    (notification) =>
      notification.read
        ? notification
        : { ...notification, read: true, readAt: new Date().toISOString() },
  );
};

export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          unreadCount: MOCK_NOTIFICATIONS.notifications.filter(
            (notification) => !notification.read,
          ).length,
        }),
      200,
    ),
  );
};

export const registerPushToken = async (
  _req: PushTokenRequest,
): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 200));
};

export const deletePushToken = async (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 200));
};
