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

/** 로그인 관련 타입 */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse extends User {
  accessToken: string;
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
