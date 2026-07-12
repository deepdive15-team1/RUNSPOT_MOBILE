import { RequestStatus } from "@/src/types/api/manageParticipants";

export const participantKeys = {
  // 특정 세션의 모든 참여자 데이터를 통째로 새로고침 할 때 사용
  all: (sessionId: number) => ["participants", sessionId] as const,

  // REQUESTED, APPROVED 등 상태별로 따로 조회할 때 사용
  status: (sessionId: number, status: RequestStatus) =>
    [...participantKeys.all(sessionId), status] as const,
};
