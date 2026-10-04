import { RunningRecordResponse } from "@/src/types/api/runningCourse";

export const getMyRunningRecords = async (): Promise<
  RunningRecordResponse[]
> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    {
      runningRecordId: 1,
      title: "여의도 한강공원 야간 런",
      recordedAt: "2026-09-11",
      distanceKm: 5.2,
      avgPace: "05:30",
      locationName: "여의도 한강공원",
      locationDetail: "서울 영등포구",
      mapThumbnailKey: "mock-thumbnail.jpg",
      routePolyline: JSON.stringify([
        { x: 126.978, y: 37.5665 },
        { x: 126.982, y: 37.568 },
      ]),
    },
    {
      runningRecordId: 2,
      title: "올림픽공원 주말 조깅",
      recordedAt: "2026-09-01",
      distanceKm: 10.0,
      avgPace: "06:00",
      locationName: "올림픽공원",
      locationDetail: "서울 송파구",
      mapThumbnailKey: "mock-thumbnail2.jpg",
      routePolyline: JSON.stringify([
        { x: 127.0, y: 37.55 },
        { x: 127.005, y: 37.553 },
      ]),
    },
  ];
};
