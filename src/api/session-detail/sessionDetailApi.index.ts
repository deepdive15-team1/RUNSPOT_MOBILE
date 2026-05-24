import { getSessionDetail as mockGetSessionDetail } from "@/src/api/session-detail//sessionDetailApi.mock";
import { joinSession as mockJoinSession } from "@/src/api/session-detail//sessionDetailApi.mock";
import { getSessionDetail as realGetSessionDetail } from "@/src/api/session-detail/sessionDetailApi";
import { joinSession as realJoinSession } from "@/src/api/session-detail/sessionDetailApi";

const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

/**
 * 러닝 세션 상세 정보 조회
 * @param sessionId - 조회할 러닝 세션의 고유 ID
 * @returns 러닝 세션의 상세 정보
 */
export const getSessionDetail = isMock
  ? mockGetSessionDetail
  : realGetSessionDetail;

export const joinSession = isMock ? mockJoinSession : realJoinSession;
