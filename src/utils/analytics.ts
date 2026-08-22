/* istanbul ignore file */
import {
  getAnalytics,
  logEvent,
  setUserId,
} from "@react-native-firebase/analytics";

type EventParams = Record<string, string | number | boolean | null | undefined>;

const analytics = getAnalytics();

export const AnalyticsHelper = {
  setUserId: async (userId: string | null) => {
    try {
      await setUserId(analytics, userId);
    } catch (err) {
      console.error("Analytics error: ", err);
    }
  },

  logEvent: async (eventName: string, params: EventParams) => {
    try {
      await logEvent(analytics, eventName, params);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  },
};
