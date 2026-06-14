import { axiosInstance } from "@/src/api/axiosInstance";
import type {
  CreateSessionRequest,
  CreateSessionResponse,
} from "@/src/types/api/createSession";

export const createSession = async (
  requestBody: CreateSessionRequest,
): Promise<CreateSessionResponse> => {
  const response = await axiosInstance.post<CreateSessionResponse>(
    "/sessions",
    requestBody,
  );
  return response.data;
};
