import { AttendanceStatus } from "./attendance";
import { Gender } from "./auth";

export type RequestStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "CANCELED";

export interface JoinRequest {
  id: number;
  userId: number;
  userName: string;
  userGender: Gender;
  status: RequestStatus;
  attendanceStatus: AttendanceStatus;
  messageToHost: string;
  requestedAt: string;
}
