export type RunType = "LSD" | "INTERVAL" | "RECOVERY";
export type RoutePolyline = { x: number; y: number }[];
export type GenderPolicy = "MALE_ONLY" | "FEMALE_ONLY" | "MIXED";

export interface CreateSessionDraft {
  title: string;
  runType: RunType | "";
  locationName: string;
  locationX: string;
  locationY: string;
  routePolyline: RoutePolyline;
  targetDistanceKm: string;
  avgPace: string;
  startAt: string;
  capacity: string;
  genderPolicy: GenderPolicy | "";
}
