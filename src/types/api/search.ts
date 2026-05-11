export interface GetMarkersParams {
  leftX: number;
  leftY: number;
  rightX: number;
  rightY: number;
}

export interface MapMarkerResponse {
  id: number;
  title: string;
  x: number;
  y: number;
}

export interface RunningItem {
  id: number;
  title: string;
  startAt: string;
  locationName: string;
  targetDistanceKm: number;
  avgPaceSec: number;
  genderPolicy: string;
  runType: string;
}
