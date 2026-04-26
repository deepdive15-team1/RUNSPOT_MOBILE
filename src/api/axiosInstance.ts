import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { getAccessToken } from "@/src/api/authToken";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL is not set");
}

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  // 쿠키 기반 인증을 쓸 때만 유지 (서버 정책에 따라)
  // withCredentials: true,
});

// 401 에러(인증 실패) 처리를 위한 핸들러
// 콜백만 호출하고 실제 행동은 상위(스토어/루트)로 전달하여 결합도 낮추기
// 이는 axios 레이어에서는 HTTP 요청/응답 처리, 앱 상위 레이어에서는 라우팅 등 비즈니스 로직 처리를 분리하기 위함
let onUnauthorized: ((message: string) => void) | null = null;

export function setUnauthorizedHandler(handler: (message: string) => void) {
  onUnauthorized = handler;
}

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      const message = error.response.data?.message ?? "로그인이 필요합니다.";
      onUnauthorized?.(message);
    }
    return Promise.reject(error);
  },
);
