import { axiosInstance } from "@/src/api/axiosInstance";
import {
  GetMarkersParams,
  MapMarkerResponse,
  RunningItem,
} from "@/src/types/api/search";

export const getMapMarkers = async (
  params: GetMarkersParams,
): Promise<MapMarkerResponse[]> => {
  const response = await axiosInstance.get("/sessions/search/markers", {
    params: params,
  });

  return response.data;
};

export const getSessionDetail = async (
  sessionId: number,
): Promise<RunningItem> => {
  const response = await axiosInstance.get(`/sessions/${sessionId}/summary`);
  return response.data;
};
