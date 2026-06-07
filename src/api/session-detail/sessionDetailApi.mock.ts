/* eslint-disable no-console */
import { DUMMY_DATA } from "../search/searchApi.mock";

import type { SessionDetailResponse } from "@/src/types/api/session-detail";

export const getSessionDetail = async (
  sessionId: number,
): Promise<SessionDetailResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const baseData = DUMMY_DATA.find((item) => item.id === sessionId);

  if (!baseData) {
    throw new Error(`Session ID ${sessionId}를 찾을 수 없습니다.`);
  }

  return {
    ...baseData,
    hostName: "러너김",
    hostMannerTemp: 36.5,
    participants: ["이민수", "박지훈", "최민석"],
    routePolyline: [
      { latitude: 37.5271, longitude: 126.9233 },
      { latitude: 37.5285, longitude: 126.925 },
      { latitude: 37.5292, longitude: 126.9275 },
      { latitude: 37.5281, longitude: 126.9299 },
      { latitude: 37.5265, longitude: 126.9288 },
    ],
  };
};

export const joinSession = async (
  _sessionId: number,
  _messageToHost: string,
) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log(`[더미 API POST 요청] /sessions/${_sessionId}/join`);
  console.log("[더미 API Request Body]:", { messageToHost: _messageToHost });

  return {
    success: true,
    message: "참여 신청이 성공적으로 완료되었습니다.",
  };
};
