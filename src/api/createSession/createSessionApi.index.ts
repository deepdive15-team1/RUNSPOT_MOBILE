import { createSession as realCreateSession } from "@/src/api/createSession/createSessionApi";
import { createSession as mockCreateSession } from "@/src/api/createSession/createSessionApi.mock";

const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

export const createSession = isMock ? mockCreateSession : realCreateSession;
