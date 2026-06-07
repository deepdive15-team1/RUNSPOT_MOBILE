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
  _requestBody: SignupRequest,
): Promise<SignupResponse> => {
  return {
    userId: 1,
  };
};

export const login = async (
  _requestBody: LoginRequest,
): Promise<LoginResponse> => {
  return {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    userId: 1,
    name: "홍길동",
    ageGroup: "20S",
    gender: "MALE",
    weeklyRuns: 3,
    avgPaceMinPerKm: 270,
    mannerTemp: 36.5,
  };
};

export const refresh = async (
  _requestBody: RefreshTokenRequest,
): Promise<RefreshTokenResponse> => {
  return {
    accessToken: "mock-access-token-refreshed",
    refreshToken: "mock-refresh-token-refreshed",
  };
};

export const logout = async (
  _requestBody: LogoutRequest,
): Promise<LogoutResponse> => {
  return {
    message: "로그아웃 성공",
  };
};
