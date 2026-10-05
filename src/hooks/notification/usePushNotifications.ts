import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

import { NotificationApi } from "@/src/api/notification/notificationApi.index";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#007AFF",
    });
  }

  if (!Device.isDevice) {
    console.warn("푸시 알림은 실제 기기에서만 사용할 수 있습니다.");
    return undefined;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("푸시 알림 권한이 허용되지 않았습니다.");
    return undefined;
  }

  try {
    return (await Notifications.getDevicePushTokenAsync()).data;
  } catch {
    console.warn("기기 푸시 토큰을 가져오지 못했습니다.");
    return undefined;
  }
}

export function usePushNotifications(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    let isActive = true;
    const register = async () => {
      let token: string | undefined;
      try {
        token = await registerForPushNotificationsAsync();
      } catch {
        console.warn("푸시 알림을 초기화하지 못했습니다.");
        return;
      }
      if (!isActive || !token) return;

      try {
        await NotificationApi.registerPushToken({
          token,
          platform: Platform.OS === "ios" ? "IOS" : "ANDROID",
        });
      } catch {
        console.warn("푸시 토큰 등록에 실패했습니다.");
      }
    };

    void register();
    return () => {
      isActive = false;
    };
  }, [enabled]);
}
