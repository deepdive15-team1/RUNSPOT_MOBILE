/**
 * 인증(로그인/회원가입) 요청·응답 타입
 */

export type AgeGroup = "10S" | "20S" | "30S" | "40S" | "50S" | "60S";
export type Gender = "MALE" | "FEMALE";

export interface User {
  userId: number;
  name: string;
  ageGroup: AgeGroup;
  gender: Gender;
  weeklyRuns: number;
  avgPaceMinPerKm: number;
  mannerTemp: number;
}

/** JWT 액세스 토큰과 리프레시 토큰 쌍 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** 로그인 요청 타입 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 로그인 응답 타입 */
export type LoginResponse = User & AuthTokens;

/** 토큰 재발급 요청 타입 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** 토큰 재발급 응답 타입 */
export type RefreshTokenResponse = AuthTokens;

/** 로그아웃 요청 타입 */
export interface LogoutRequest {
  refreshToken: string;
}

/** 로그아웃 응답 타입 */
export interface LogoutResponse {
  message: string;
}

/** 회원가입 관련 타입 */
export interface SignupRequest {
  username: string;
  password: string;
  name: string;
  ageGroup: AgeGroup;
  gender: Gender;
  weeklyRuns: number;
  avgPaceMinPerKm: number;
}

export interface SignupResponse {
  userId: number;
}
