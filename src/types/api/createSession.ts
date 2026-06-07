/**
 * 러닝 세션 개설 API 요청·응답에 쓰는 타입.
 */
export type RunType = "LSD" | "INTERVAL" | "RECOVERY";
export type RoutePolyline = { x: number; y: number }[];
export type GenderPolicy = "MALE_ONLY" | "FEMALE_ONLY" | "MIXED";

export interface Session {
  title: string;
  runType: RunType;
  locationName: string;
  locationX: number;
  locationY: number;
  routePolyline: RoutePolyline;
  targetDistanceKm: number;
  avgPaceSec: number;
  startAt: string;
  capacity: number;
  genderPolicy: GenderPolicy;
}

export type CreateSessionRequest = Session;

export interface CreateSessionResponse extends Session {
  id: number;
  hostUserId: number;
  status: string;
}
