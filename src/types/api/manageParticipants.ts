import { Gender } from "./auth";

export type RequestStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "CANCELED";

export interface JoinRequest {
  id: number;
  userId: number;
  userName: string;
  userGender: Gender;
  status: RequestStatus;
  attendanceStatus: string;
  messageToHost: string;
  requestedAt: string;
}
