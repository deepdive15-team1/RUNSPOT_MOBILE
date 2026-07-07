import { JoinRequest } from "@/src/types/api/manageParticipants";

let mockRequestedMembers: JoinRequest[] = [
  {
    id: 101,
    userId: 1,
    userName: "박서준",
    userGender: "MALE",
    status: "REQUESTED",
    attendanceStatus: "DEFAULT",
    messageToHost: "페이스가 저랑 딱 맞네요! 열심히 뛰겠습니다.",
    requestedAt: "2026-06-29T08:30:00.000Z",
  },
  {
    id: 102,
    userId: 2,
    userName: "이민지",
    userGender: "FEMALE",
    status: "REQUESTED",
    attendanceStatus: "DEFAULT",
    messageToHost: "여의도에서 자주 뛰는데 같이 달리고 싶어요!",
    requestedAt: "2026-06-29T09:15:00.000Z",
  },
];

const mockApprovedMembers: JoinRequest[] = [
  {
    id: 103,
    userId: 3,
    userName: "러너김",
    userGender: "MALE",
    status: "APPROVED",
    attendanceStatus: "DEFAULT",
    messageToHost: "잘 부탁드립니다! 시간 맞춰서 가겠습니다.",
    requestedAt: "2026-06-28T14:20:00.000Z",
  },
  {
    id: 104,
    userId: 4,
    userName: "정수아",
    userGender: "FEMALE",
    status: "APPROVED",
    attendanceStatus: "DEFAULT",
    messageToHost: "오랜만에 러닝이네요, 기대됩니다.",
    requestedAt: "2026-06-28T15:45:00.000Z",
  },
  {
    id: 105,
    userId: 5,
    userName: "최다은",
    userGender: "FEMALE",
    status: "APPROVED",
    attendanceStatus: "DEFAULT",
    messageToHost: "항상 뛰던 코스라 바로 신청합니다.",
    requestedAt: "2026-06-28T18:10:00.000Z",
  },
];

export const getParticipantsByStatus = async (
  _sessionId: number,
  status: string,
): Promise<JoinRequest[]> => {
  if (status === "REQUESTED") {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockRequestedMembers), 800),
    );
  }

  if (status === "APPROVED") {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockApprovedMembers), 800),
    );
  }

  return new Promise((resolve) => setTimeout(() => resolve([]), 800));
};

export const acceptParticipant = async (
  _sessionId: number,
  participantId: number,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const targetIndex = mockRequestedMembers.findIndex(
    (m) => m.id === participantId,
  );
  if (targetIndex !== -1) {
    const [targetMember] = mockRequestedMembers.splice(targetIndex, 1);
    targetMember.status = "APPROVED";
    mockApprovedMembers.push(targetMember);
  }
};

export const rejectParticipant = async (
  _sessionId: number,
  participantId: number,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  mockRequestedMembers = mockRequestedMembers.filter(
    (m) => m.id !== participantId,
  );
};

export const closeSession = async (_sessionId: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  mockRequestedMembers = [];
};
