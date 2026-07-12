import { JoinRequest } from "./manageParticipants";

export type AttendanceStatus = "ATTENDED" | "ABSENT";

export interface UpdateAttendanceParams {
  sessionId: number;
  participationId: number;
  status: AttendanceStatus;
}

export type AttendanceMember = JoinRequest;
