import { JoinRequest } from "@/src/types/api/manageParticipants";

let mockApprovedMembers: JoinRequest[] = [
  {
    id: 103,
    userId: 3,
    userName: "러너김",
    userGender: "MALE",
    status: "APPROVED",
    attendanceStatus: "ATTENDED",
    messageToHost: "잘 부탁드립니다! 시간 맞춰서 가겠습니다.",
    requestedAt: "2026-06-28T14:20:00.000Z",
  },
  {
    id: 104,
    userId: 4,
    userName: "정수아",
    userGender: "FEMALE",
    status: "APPROVED",
    attendanceStatus: "ABSENT",
    messageToHost: "오랜만에 러닝이네요, 기대됩니다.",
    requestedAt: "2026-06-28T15:45:00.000Z",
  },
  {
    id: 105,
    userId: 5,
    userName: "최다은",
    userGender: "FEMALE",
    status: "APPROVED",
    attendanceStatus: "ABSENT",
    messageToHost: "항상 뛰던 코스라 바로 신청합니다.",
    requestedAt: "2026-06-28T18:10:00.000Z",
  },
];

/**
 * [Mock] 러닝 세션 시작
 */
export const startSession = async (_sessionId: number): Promise<void> => {
  // 실제 네트워크 지연 흉내내기 (0.5초)
  await new Promise((resolve) => setTimeout(resolve, 500));
};

/**
 * [Mock] 러닝 세션 종료
 */
export const finishSession = async (_sessionId: number): Promise<void> => {
  // 실제 네트워크 지연 흉내내기 (0.5초)
  await new Promise((resolve) => setTimeout(resolve, 500));
};

/**
 * [Mock] 참여자 내보내기
 */
export const kickOutParticipant = async (
  sessionId: number,
  participationId: number,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  mockApprovedMembers = mockApprovedMembers.filter(
    (m) => m.id !== participationId,
  );
};
