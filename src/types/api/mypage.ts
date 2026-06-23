import type { GenderPolicy } from "../search/search";

export type ApproveStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ResultStatus = "DONE" | "NOSHOW";
export type RunningStatus = "OPEN" | "CLOSED" | "CANCELED" | "FINISHED";
export type Gender = "MALE" | "FEMALE";
export type AgeGroup = "10S" | "20S" | "30S" | "40S" | "50S";

export interface UserProfile {
  userId: number;
  name: string;
  ageGroup: AgeGroup;
  gender: Gender;
  weeklyRuns?: number;
  avgPaceMinPerKm?: string;
  mannerTemp: number;
  totalRuns?: number;
  totalDistanceKm?: number;
}

export interface CreatedRunning {
  id: number;
  hostUserId: number;
  title: string;
  runType: string;
  locationName: string;
  locationX: number;
  locationY: number;
  routePolyline: { x: number; y: number }[];
  targetDistanceKm: number;
  avgPaceSec: number;
  startAt: string;
  capacity: number;
  currentParticipants: number;
  genderPolicy: GenderPolicy;
  status: RunningStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreatedRunningResponse = CreatedRunning[];

export interface AppliedRunning {
  runningId: number;
  title: string;
  date: string;
  time: string;
  approveStatus: ApproveStatus;
  chatEnabled?: boolean;
}

export interface AppliedRunningsResponse {
  appliedRunnings: AppliedRunning[];
}

export interface RecentRunning {
  runningId: number;
  title: string;
  date: string;
  resultStatus: ResultStatus;
}

export interface RecentRunningsResponse {
  recentRunnings: RecentRunning[];
}
