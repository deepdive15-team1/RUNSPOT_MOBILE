import {
  getProfile as realgetProfile,
  getCreatedRuns as realgetCreatedRuns,
  getAppliedRuns as realgetAppliedRuns,
  getHistoryRuns as realgetHistoryRuns,
} from "./myPageApi";
import {
  getProfile as mockgetProfile,
  getCreatedRuns as mockgetCreatedRuns,
  getAppliedRuns as mockgetAppliedRuns,
  getHistoryRuns as mockgetHistoryRuns,
} from "./myPageApi.mock";

const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

/**
 * 마이페이지 사용자 프로필 및 러닝 통계 정보 조회
 * @returns 사용자의 기본 정보, 매너온도, 누적 러닝 기록 등 (UserProfile)
 */
export const getProfile = isMock ? mockgetProfile : realgetProfile;

/**
 * 내가 만든 러닝 세션 목록 조회
 * @returns 모집 중이거나 내가 생성한 러닝 세션 목록 (최대 3개, CreatedRunning 배열)
 */
export const getCreatedRuns = isMock ? mockgetCreatedRuns : realgetCreatedRuns;

/**
 * 내가 신청한 러닝 세션 목록 조회
 * @returns 참여 대기 중이거나 승인 확정된 러닝 세션 목록 (최대 3개, AppliedRunning 배열)
 */
export const getAppliedRuns = isMock ? mockgetAppliedRuns : realgetAppliedRuns;

/**
 * 최근 참여 완료한 러닝 내역 조회
 * @returns 최근에 참여하여 종료된 러닝 세션 내역 (최대 3개, RecentRunning 배열)
 */
export const getHistoryRuns = isMock ? mockgetHistoryRuns : realgetHistoryRuns;
