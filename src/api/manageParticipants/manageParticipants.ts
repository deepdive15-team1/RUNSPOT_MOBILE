import { axiosInstance } from "../axiosInstance";

import { JoinRequest } from "@/src/types/api/manageParticipants";

export const getParticipantsByStatus = async (
  sessionId: number,
  status: string,
): Promise<JoinRequest[]> => {
  const response = await axiosInstance.get(
    `/sessions/${sessionId}/join-requests?status=${status}`,
  );
  return response.data;
};

export const acceptParticipant = async (
  sessionId: number,
  participationId: number,
): Promise<void> => {
  await axiosInstance.post(
    `sessions/${sessionId}/join-requests/${participationId}/approve`,
  );
};

export const rejectParticipant = async (
  sessionId: number,
  participationId: number,
): Promise<void> => {
  await axiosInstance.post(
    `sessions/${sessionId}/join-requests/${participationId}/reject`,
  );
};

export const closeSession = async (sessionId: number): Promise<void> => {
  await axiosInstance.post(`sessions/${sessionId}/close`);
};
