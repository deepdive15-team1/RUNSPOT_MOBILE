import { nearbySession as realNearbySession } from "@/src/api/nearbySession/nearbySessionApi";
import { nearbySession as mockNearbySession } from "@/src/api/nearbySession/nearbySessionApi.mock";

const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

export const nearbySession = isMock ? mockNearbySession : realNearbySession;
