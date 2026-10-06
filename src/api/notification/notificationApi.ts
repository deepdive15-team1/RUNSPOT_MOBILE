import { axiosInstance } from "../axiosInstance";

import type {
  NotificationListResponse,
  UnreadCountResponse,
  PushTokenRequest,
} from "@/src/types/api/notification";

export const getNotifications = async (
  cursorId?: number,
  size = 20,
  unreadOnly = false,
): Promise<NotificationListResponse> => {
  const { data } = await axiosInstance.get<NotificationListResponse>(
    "/users/me/notifications",
    {
      params: { cursorId, size, unreadOnly },
    },
  );
  return data;
};

export const readNotification = async (
  notificationId: number,
): Promise<void> => {
  await axiosInstance.patch(`/users/me/notifications/${notificationId}/read`);
};

export const readAllNotifications = async (): Promise<void> => {
  await axiosInstance.patch("/users/me/notifications/read-all");
};

export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const { data } = await axiosInstance.get<UnreadCountResponse>(
    "/users/me/notifications/unread-count",
  );
  return data;
};

export const registerPushToken = async (
  req: PushTokenRequest,
): Promise<void> => {
  await axiosInstance.put("/users/me/push-token", req);
};

export const deletePushToken = async (): Promise<void> => {
  await axiosInstance.delete("/users/me/push-token");
};
