import { axiosInstance } from "@/src/api/axiosInstance";
import type {
  NearbySessionRequest,
  NearbySessionResponse,
} from "@/src/types/api/nearbySession";

export const nearbySession = async (
  requestBody: NearbySessionRequest,
): Promise<NearbySessionResponse[]> => {
  const response = await axiosInstance.get<NearbySessionResponse[]>(
    "/sessions/search/nearby",
    { params: requestBody },
  );
  return response.data;
};
