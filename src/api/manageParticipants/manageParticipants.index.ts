import {
  getParticipantsByStatus as realGetParticipantsByStatus,
  acceptParticipant as realAcceptParticipant,
  rejectParticipant as realRejectParticipantal,
  closeSession as realCloseSession,
} from "./manageParticipants";
import {
  getParticipantsByStatus as mockGetParticipantsByStatus,
  acceptParticipant as mockAcceptParticipant,
  rejectParticipant as mockRejectParticipant,
  closeSession as mockCloseSession,
} from "./manageParticipants.mock";

const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

export const getParticipantsByStatus = isMock
  ? mockGetParticipantsByStatus
  : realGetParticipantsByStatus;

export const acceptParticipant = isMock
  ? mockAcceptParticipant
  : realAcceptParticipant;

export const rejectParticipant = isMock
  ? mockRejectParticipant
  : realRejectParticipantal;

export const closeSession = isMock ? mockCloseSession : realCloseSession;
