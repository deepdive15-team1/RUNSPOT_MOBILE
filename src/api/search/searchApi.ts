import { axiosInstance } from "@/src/api/axiosInstance";
import {
  GetMarkersParams,
  MapMarkerResponse,
  RunningSearchResponse,
  SearchParamType,
} from "@/src/types/api/search";

export const getMapMarkers = async (
  params: GetMarkersParams,
): Promise<MapMarkerResponse[]> => {
  const response = await axiosInstance.get("/sessions/search/markers", {
    params: params,
  });

  return response.data;
};

export const searchSessions = async (
  params: SearchParamType,
): Promise<RunningSearchResponse> => {
  const response = await axiosInstance.get("/sessions/search", { params });
  return response.data;
};

export const getSessionSummary = async (sessionId: number) => {
  const response = await axiosInstance.get(`/sessions/${sessionId}/summary`);
  return response.data;
};
