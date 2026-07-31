import { axiosInstance } from "../axiosInstance";

import { HostRatingRequest, MemberRatingRequest } from "@/src/types/api/rating";

/**
 * 호스트 평가 API
 */
export const rateHost = async (
  sessionId: number,
  data: HostRatingRequest,
): Promise<void> => {
  await axiosInstance.post(`/sessions/${sessionId}/ratings/host`, data);
};

/**
 * 멤버 평가 API
 */
export const rateMembers = async (
  sessionId: number,
  data: MemberRatingRequest,
): Promise<void> => {
  await axiosInstance.post(`/sessions/${sessionId}/ratings/members`, data);
};
