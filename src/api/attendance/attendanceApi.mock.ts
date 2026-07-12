import {
  UpdateAttendanceParams,
  AttendanceMember,
} from "@/src/types/api/attendance";

// Mock 데이터
let mockAttendanceList: AttendanceMember[] = [
  {
    userId: 1,
    userName: "박서준",
    attendanceStatus: "ABSENT",
  },
  {
    userId: 2,
    userName: "김지은",
    attendanceStatus: "ABSENT",
  },
  {
    userId: 3,
    userName: "이민호",
    attendanceStatus: "ATTENDED",
  },
  {
    userId: 4,
    userName: "최유리",
    attendanceStatus: "ABSENT",
  },
] as AttendanceMember[];

/**
 * [MOCK] 출석부(참여 멤버 목록) 조회
 */
export const getAttendance = async (
  _sessionId: number,
): Promise<AttendanceMember[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockAttendanceList);
    }, 500);
  });
};

/**
 * [MOCK] 단일 멤버 출석 상태 업데이트
 */
export const updateAttendance = async ({
  // sessionId,
  participationId,
  status,
}: UpdateAttendanceParams) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockAttendanceList = mockAttendanceList.map((member) =>
        member.userId === participationId
          ? { ...member, attendanceStatus: status }
          : member,
      );

      resolve({
        success: true,
        message: "출석 상태가 성공적으로 변경되었습니다.",
      });
    }, 500);
  });
};
