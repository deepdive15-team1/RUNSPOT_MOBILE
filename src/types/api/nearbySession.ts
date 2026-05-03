export interface NearbySessionRequest {
  x: number;
  y: number;
  size?: number;
}

export interface NearbySessionResponse {
  id: number;
  title: string;
  applicants: number;
  maxCapacity: number;
  locationName: string;
  distanceFromPositionKm: number;
  targetDistanceKm: number;
  avgPaceSec: number;
  startAt: string;
}
