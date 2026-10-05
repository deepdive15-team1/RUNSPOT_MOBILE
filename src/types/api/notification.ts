export type NotificationType =
  | "PARTICIPATION_REQUESTED"
  | "PARTICIPATION_APPROVED"
  | "PARTICIPATION_REJECTED"
  | "PARTICIPANT_KICKED"
  | "SESSION_START_REMINDER";

export type NotificationActionType = "APPROVE_OR_REJECT" | "NAVIGATE";
export type NotificationActionStatus = "PENDING" | "RESOLVED" | "NONE";

export interface NotificationActor {
  id: number;
  name: string;
  profileImageUrl: string | null;
}

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  actor: NotificationActor | null;
  sessionId: number;
  participationId: number | null;
  actionType: NotificationActionType;
  actionStatus: NotificationActionStatus;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  nextCursorId: number | null;
  hasNext: boolean;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface PushTokenRequest {
  token: string;
  platform: "ANDROID" | "IOS";
}
