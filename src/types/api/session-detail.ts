import type { RunningItem } from "./search";

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface SessionDetailResponse extends RunningItem {
  hostName: string;
  hostMannerTemp: number;
  participants?: string[];
  routePolyline: RoutePoint[];
}
