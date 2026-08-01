import {
  startSession as realStartSession,
  finishSession as realFinishSession,
  kickOutParticipant as realKickOutParticipant,
} from "./sessionApi";
import {
  startSession as mockStartSession,
  finishSession as mockFinishSession,
  kickOutParticipant as mockKickOutParticipant,
} from "./sessionApi.mock";

const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

/**
 * 러닝 세션 공식 시작 API
 * @param sessionId - 시작할 러닝 세션의 고유 ID
 * @returns 200 OK (void)
 */
export const startSession = isMock ? mockStartSession : realStartSession;

/**
 * 러닝 세션 공식 종료 API
 * @param sessionId - 종료할 러닝 세션의 고유 ID
 * @returns 200 OK (void)
 */
export const finishSession = isMock ? mockFinishSession : realFinishSession;

/**
 * 러닝 세션 참여자 내보내기 API
 * @param sessionId - 러닝 세션의 고유 ID
 * @param participationId - 내보낼 참여자의 고유 ID (참여 정보 ID)
 * @returns 200 OK (void)
 */
export const kickOutParticipant = isMock
  ? mockKickOutParticipant
  : realKickOutParticipant;
