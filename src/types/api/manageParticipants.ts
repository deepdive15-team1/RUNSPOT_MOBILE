import { Gender } from "./auth";

export type requestStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "CANCELED";

export interface JoinRequest {
  id: number;
  userId: number;
  userName: string;
  userGender: Gender;
  status: requestStatus;
  attendanceStatus: string;
  messageToHost: string;
  requestedAt: string;
}
