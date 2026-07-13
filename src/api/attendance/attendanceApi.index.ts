import {
  getAttendance as realGetAttendance,
  updateAttendance as realUpdateAttendance,
} from "./attendanceApi";
import {
  getAttendance as mockGetAttendance,
  updateAttendance as mockUpdateAttendance,
} from "./attendanceApi.mock";

const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

/**
 * 출석부(참여 멤버 목록) 조회
 * @param sessionId - 출석 상태를 조회할 러닝 세션의 고유 ID
 * @returns 해당 세션에 승인된 참여자 목록 및 현재 출석 상태 (AttendanceMember 배열)
 */
export const getAttendance = isMock ? mockGetAttendance : realGetAttendance;

/**
 * 단일 멤버 출석 상태 업데이트
 * @param params - 세션 ID, 참여 번호(participationId), 변경할 출석 상태(ATTENDED | ABSENT)
 * @returns 상태 업데이트 성공 여부 및 결과 데이터
 */
export const updateAttendance = isMock
  ? mockUpdateAttendance
  : realUpdateAttendance;
