import type {
  NearbySessionRequest,
  NearbySessionResponse,
} from "@/src/types/api/nearbySession";

export const nearbySession = async (
  request: NearbySessionRequest,
): Promise<NearbySessionResponse[]> => {
  const size = request.size ?? 3;
  const list: NearbySessionResponse[] = [
    {
      id: 0,
      title: "string",
      applicants: 0,
      maxCapacity: 0,
      locationName: "string",
      distanceFromPositionKm: 0,
      targetDistanceKm: 0,
      avgPaceSec: 0,
      startAt: "2026-02-07T21:59:17.405Z",
    },
    {
      id: 1,
      title: "string",
      applicants: 0,
      maxCapacity: 0,
      locationName: "string",
      distanceFromPositionKm: 0,
      targetDistanceKm: 0,
      avgPaceSec: 0,
      startAt: "2026-02-08T21:59:17.405Z",
    },
    {
      id: 2,
      title: "string",
      applicants: 0,
      maxCapacity: 0,
      locationName: "string",
      distanceFromPositionKm: 0,
      targetDistanceKm: 0,
      avgPaceSec: 0,
      startAt: "2026-02-09T21:59:17.405Z",
    },
  ];
  return list.slice(0, size);
};
