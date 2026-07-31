import {
  rateHost as realRateHost,
  rateMembers as realRateMembers,
} from "./ratingApi";
import {
  rateHost as mockRateHost,
  rateMembers as mockRateMembers,
} from "./ratingApi.mock";

const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

/**
 * 러닝 세션 호스트 평가 API
 * 참여자가 러닝을 마친 후 호스트의 진행에 대한 평가(만족도 및 피드백 태그)를 제출합니다.
 * @param sessionId - 평가할 러닝 세션의 고유 ID
 * @param data - 호스트 평가 데이터 (rating: 긍정/부정, tags: 추가 피드백 배열)
 * @returns 200 OK (void)
 */
export const rateHost = isMock ? mockRateHost : realRateHost;

/**
 * 러닝 세션 멤버 평가 API
 * 호스트가 러닝을 마친 후 참석이 확정된 멤버들에 대한 평가(매너 평가)를 일괄 제출합니다.
 * @param sessionId - 평가할 러닝 세션의 고유 ID
 * @param data - 멤버 평가 데이터 (대상 유저 ID와 평가 상태가 담긴 배열)
 * @returns 200 OK (void)
 */
export const rateMembers = isMock ? mockRateMembers : realRateMembers;
