import { GenderPolicy, RunType } from "../search/search";

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
  genderPolicy: GenderPolicy;
  runType: RunType;
}

export interface RunningSearchResponse {
  size: number;
  content: RunningItem[];
  number: number;
  sort: { empty: boolean; sorted: boolean; unsorted: boolean };
  numberOfElements: number;
  pageable: {
    offset: number;
    sort: { empty: boolean; sorted: boolean; unsorted: boolean };
    paged: boolean;
    pageNumber: number;
    pageSize: number;
    unpaged: boolean;
  };
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface SearchParamType {
  q: string;
  size: number;
  cursorId?: number;
}
