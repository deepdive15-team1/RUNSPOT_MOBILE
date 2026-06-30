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
