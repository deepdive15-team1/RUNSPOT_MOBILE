import { axiosInstance } from "../axiosInstance";

export const startSession = async (sessionId: number): Promise<void> => {
  await axiosInstance.post(`/sessions/${sessionId}/start`);
};

export const finishSession = async (sessionId: number): Promise<void> => {
  await axiosInstance.post(`/sessions/${sessionId}/finish`);
};

export const kickOutParticipant = async (
  sessionId: number,
  participationId: number,
): Promise<void> => {
  await axiosInstance.delete(
    `/sessions/${sessionId}/participants/${participationId}`,
  );
};
