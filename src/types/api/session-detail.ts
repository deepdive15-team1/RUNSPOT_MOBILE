import type { RunningItem } from "./search";

export interface RoutePoint {
  x: number;
  y: number;
}

export interface SessionDetailResponse extends RunningItem {
  hostName: string;
  hostMannerTemp: number;
  participants?: string[];
  routePolyline: RoutePoint[];
}
