import { axiosInstance } from "@/src/api/axiosInstance";
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from "@/src/types/api/auth";

export const signup = async (
  requestBody: SignupRequest,
): Promise<SignupResponse> => {
  const response = await axiosInstance.post<SignupResponse>(
    "/auth/signup",
    requestBody,
  );
  return response.data;
};

export const login = async (
  requestBody: LoginRequest,
): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(
    "/auth/login",
    requestBody,
  );
  return response.data;
};

export const logout = async (): Promise<void> => {
  await axiosInstance.post("/auth/logout");
};
