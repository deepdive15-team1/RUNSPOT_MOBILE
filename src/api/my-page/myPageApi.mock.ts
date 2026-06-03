import type {
  UserProfile,
  AppliedRunning,
  RecentRunning,
} from "@/src/types/api/mypage";
import {
  AppliedRunningsResponse,
  RecentRunningsResponse,
  CreatedRunningResponse,
} from "@/src/types/api/mypage";

// 마이페이지 프로필 데이터
export const MOCK_PROFILE: UserProfile = {
  id: 1,
  name: "러너김",
  ageGroup: "30대",
  gender: "남성",
  mannerTemp: 36.5,
  weeklyRuns: 3,
  avgPaceMinPerKm: "5:45 min/km",
  totalRuns: 15,
  totalDistanceKm: 85,
};

// 내가 만든 러닝
export const MOCK_CREATED: CreatedRunningResponse = [
  {
    id: 1,
    hostUserId: 1,
    title: "여의도 야간 러닝",
    runType: "REGULAR",
    locationName: "여의도 한강공원 이벤트광장",
    locationX: 126.9343,
    locationY: 37.5273,
    routePolyline: [
      { x: 126.9343, y: 37.5273 },
      { x: 126.9355, y: 37.5285 },
    ],
    targetDistanceKm: 5.0,
    avgPaceSec: 330,
    startAt: "2026-06-05T20:00:00Z",
    capacity: 5,
    currentParticipants: 3,
    genderPolicy: "MIXED",
    status: "OPEN",
    createdAt: "2026-05-31T09:00:00Z",
    updatedAt: "2026-05-31T09:00:00Z",
  },
  {
    id: 2,
    hostUserId: 1,
    title: "반포 달빛 무지개 분수 런",
    runType: "REGULAR",
    locationName: "반포 한강공원",
    locationX: 126.9959,
    locationY: 37.5105,
    routePolyline: [{ x: 126.9959, y: 37.5105 }],
    targetDistanceKm: 7.5,
    avgPaceSec: 300, // 5분 00초
    startAt: "2026-06-10T19:30:00Z",
    capacity: 10,
    currentParticipants: 10,
    genderPolicy: "MALE_ONLY",
    status: "CLOSED",
    createdAt: "2026-05-30T15:00:00Z",
    updatedAt: "2026-05-30T15:00:00Z",
  },
];

// 신청한 러닝
export const MOCK_APPLIED: AppliedRunning[] = [
  {
    runningId: 1,
    title: "석촌호수 아침 조깅",
    date: "2026-10-25",
    time: "07:00",
    approveStatus: "PENDING",
  },
  {
    runningId: 2,
    title: "탄천 자전거도로 런",
    date: "2026-10-26",
    time: "08:30",
    approveStatus: "APPROVED",
    chatEnabled: true,
  },
  {
    runningId: 3,
    title: "남산 둘레길 런",
    date: "2026-10-27",
    time: "18:00",
    approveStatus: "PENDING",
  },
];

// 최근 참여 내역
export const MOCK_HISTORY: RecentRunning[] = [
  {
    runningId: 1,
    title: "반포 한강 런",
    date: "2026-10-20",
    resultStatus: "DONE",
  },
  {
    runningId: 2,
    title: "올림픽공원 러닝",
    date: "2026-10-18",
    resultStatus: "DONE",
  },
  {
    runningId: 3,
    title: "석촌호수 런",
    date: "2026-10-15",
    resultStatus: "DONE",
  },
];

// 내 정보 조회
export const getProfile = async (): Promise<UserProfile> => {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_PROFILE), 800));
};

// 내가 만든 러닝 조회
export const getCreatedRuns = async (): Promise<CreatedRunningResponse> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(MOCK_CREATED), 1200),
  );
};

// 신청한 러닝 조회
export const getAppliedRuns = async (): Promise<AppliedRunningsResponse> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ appliedRunnings: MOCK_APPLIED }), 1000),
  );
};

// 최근 참여 내역 조회
export const getHistoryRuns = async (): Promise<RecentRunningsResponse> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ recentRunnings: MOCK_HISTORY }), 1500),
  );
};
