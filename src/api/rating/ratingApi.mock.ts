import { HostRatingRequest, MemberRatingRequest } from "@/src/types/api/rating";

/**
 * [Mock] 호스트 평가 API
 */
export const rateHost = async (
  _sessionId: number,
  _data: HostRatingRequest,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
};

/**
 * [Mock] 멤버 평가 API
 */
export const rateMembers = async (
  _sessionId: number,
  _data: MemberRatingRequest,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
};
