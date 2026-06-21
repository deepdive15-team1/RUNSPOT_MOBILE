import { axiosInstance } from "@/src/api/axiosInstance";
import type {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
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

export const refresh = async (
  requestBody: RefreshTokenRequest,
): Promise<RefreshTokenResponse> => {
  const response = await axiosInstance.post<RefreshTokenResponse>(
    "/auth/refresh",
    requestBody,
  );
  return response.data;
};

export const logout = async (
  requestBody: LogoutRequest,
): Promise<LogoutResponse> => {
  const response = await axiosInstance.post<LogoutResponse>(
    "/auth/logout",
    requestBody,
  );
  return response.data;
};
