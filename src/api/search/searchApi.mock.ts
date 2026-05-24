import type {
  MapMarkerResponse,
  RunningSearchResponse,
  RunningItem,
  GetMarkersParams,
} from "@/src/types/api/search";

export const getMapMarkers = async (
  _params: GetMarkersParams,
): Promise<MapMarkerResponse[]> => {
  return [
    { id: 201, title: "여의도 한강공원 나이트런", x: 126.9333, y: 37.5271 },
    { id: 202, title: "남산 북측순환로 업힐 훈련", x: 126.9897, y: 37.5532 },
    { id: 203, title: "올림픽공원 주말 모닝 LSD", x: 127.1214, y: 37.5206 },
  ];
};

export const DUMMY_DATA: RunningItem[] = [
  {
    id: 203,
    title: "여의도 한강공원 주말 모닝 LSD",
    startAt: "2026-05-16T22:00:00.000Z",
    locationName: "서울시 영등포구 여의도 한강공원 이벤트광장",
    targetDistanceKm: 20,
    avgPaceSec: 330,
    genderPolicy: "MIXED",
    runType: "LSD",
  },
  {
    id: 202,
    title: "여의도 샛강생태공원 흙길 인터벌",
    startAt: "2026-05-18T10:30:00.000Z",
    locationName: "서울시 영등포구 여의도 샛강생태공원",
    targetDistanceKm: 7,
    avgPaceSec: 360,
    genderPolicy: "MALE_ONLY",
    runType: "INTERVAL",
  },
  {
    id: 201,
    title: "여의도 윤중로 나이트 펀런",
    startAt: "2026-05-19T11:00:00.000Z",
    locationName: "서울시 영등포구 여의도 윤중로",
    targetDistanceKm: 5,
    avgPaceSec: 420,
    genderPolicy: "MIXED",
    runType: "RECOVERY",
  },
  {
    id: 200,
    title: "여의도공원 퇴근길 10K 페이스주",
    startAt: "2026-05-20T10:30:00.000Z",
    locationName: "서울시 영등포구 여의도공원 문화의마당",
    targetDistanceKm: 10,
    avgPaceSec: 300,
    genderPolicy: "FEMALE_ONLY",
    runType: "LSD",
  },
  {
    id: 199,
    title: "여의도 서울마리나 왕복 상쾌한 조깅",
    startAt: "2026-05-22T23:00:00.000Z",
    locationName: "서울시 영등포구 여의도 서울마리나",
    targetDistanceKm: 8,
    avgPaceSec: 390,
    genderPolicy: "MIXED",
    runType: "RECOVERY",
  },
];

export const searchSessions = async (params: {
  q: string;
  size: number;
  cursorId?: number;
}): Promise<RunningSearchResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  let filteredData: RunningItem[] = [];
  if (params.q.trim() !== "") {
    filteredData = DUMMY_DATA.filter(
      (item) =>
        item.title.includes(params.q) || item.locationName.includes(params.q),
    );
  }
  let startIndex = 0;
  if (params.cursorId) {
    const cursorIndex = filteredData.findIndex(
      (item) => item.id === params.cursorId,
    );
    startIndex = cursorIndex !== -1 ? cursorIndex + 1 : 0;
  }

  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + params.size,
  );

  const isLast = startIndex + params.size >= filteredData.length;

  return {
    size: params.size,
    content: paginatedData,
    number: params.cursorId ? 1 : 0,
    sort: { empty: false, sorted: true, unsorted: false },
    numberOfElements: paginatedData.length,
    pageable: {
      offset: startIndex,
      sort: { empty: false, sorted: true, unsorted: false },
      paged: true,
      pageNumber: params.cursorId ? 1 : 0,
      pageSize: params.size,
      unpaged: false,
    },
    first: !params.cursorId,
    last: isLast,
    empty: paginatedData.length === 0,
  };
};
