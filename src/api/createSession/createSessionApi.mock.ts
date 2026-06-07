import type {
  CreateSessionRequest,
  CreateSessionResponse,
} from "@/src/types/api/createSession";

export const createSession = async (
  _requestBody: CreateSessionRequest,
): Promise<CreateSessionResponse> => {
  return {
    id: 1,
    hostUserId: 1,
    status: "OPEN",
    title: "한강 모닝 러닝",
    runType: "LSD",
    locationName: "여의도 한강공원",
    locationX: 126.9347,
    locationY: 37.5285,
    routePolyline: [
      { x: 126.9347, y: 37.5285 },
      { x: 126.935, y: 37.529 },
    ],
    targetDistanceKm: 5.0,
    avgPaceSec: 360,
    startAt: "2026-02-10T07:00:00",
    capacity: 10,
    genderPolicy: "MIXED",
  };
};
