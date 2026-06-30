import { getParticipantsByStatus as realGetParticipantsByStatus } from "./manageParticipants";
import { getParticipantsByStatus as mockGetParticipantsByStatus } from "./manageParticipants.mock";

const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

export const getParticipantsByStatus = isMock
  ? mockGetParticipantsByStatus
  : realGetParticipantsByStatus;
