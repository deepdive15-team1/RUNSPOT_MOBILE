import { axiosInstance } from "../axiosInstance";

import { SessionDetailResponse } from "@/src/types/api/session-detail";
export const getSessionDetail = async (
  sessionId: number,
): Promise<SessionDetailResponse> => {
  const response = await axiosInstance.get(`/sessions/${sessionId}`);
  return response.data;
};

export const joinSession = async (sessionId: number, messageToHost: string) => {
  const response = await axiosInstance.post(`/sessions/${sessionId}/join`, {
    messageToHost: messageToHost,
  });

  return response.data;
};
