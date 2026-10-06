import {
  getNotifications as realGetNotifications,
  readNotification as realReadNotification,
  readAllNotifications as realReadAllNotifications,
  getUnreadCount as realGetUnreadCount,
  registerPushToken as realRegisterPushToken,
  deletePushToken as realDeletePushToken,
} from "./notificationApi";
import {
  getNotifications as mockGetNotifications,
  readNotification as mockReadNotification,
  readAllNotifications as mockReadAllNotifications,
  getUnreadCount as mockGetUnreadCount,
  registerPushToken as mockRegisterPushToken,
  deletePushToken as mockDeletePushToken,
} from "./notificationApi.mock";

const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

export const NotificationApi = {
  getNotifications: isMock ? mockGetNotifications : realGetNotifications,
  readNotification: isMock ? mockReadNotification : realReadNotification,
  readAllNotifications: isMock
    ? mockReadAllNotifications
    : realReadAllNotifications,
  getUnreadCount: isMock ? mockGetUnreadCount : realGetUnreadCount,
  registerPushToken: isMock ? mockRegisterPushToken : realRegisterPushToken,
  deletePushToken: isMock ? mockDeletePushToken : realDeletePushToken,
};
