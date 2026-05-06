import type {
  LoginRequest,
  LoginResponse,
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
    userId: 1,
    name: "홍길동",
    ageGroup: "20S",
    gender: "MALE",
    weeklyRuns: 3,
    avgPaceMinPerKm: 270,
    mannerTemp: 36.5,
  };
};

export const logout = async (): Promise<void> => {
  return;
};
