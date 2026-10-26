export interface RunningRecordResponse {
  runningRecordId: number;
  title: string;
  recordedAt: string;
  distanceKm: number;
  avgPace: string;
  locationName: string;
  locationDetail: string;
  mapThumbnailKey: string;
  routePolyline: string;
}
