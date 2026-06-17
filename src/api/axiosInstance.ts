import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import {
  clearAuthTokens,
  ensureRefreshTokenLoaded,
  getAccessToken,
  setAccessToken,
  setRefreshToken,
} from "@/src/api/authToken";
import type { RefreshTokenResponse } from "@/src/types/api/auth";

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
});

/** refresh API는 interceptor를 타지 않도록 별도 클라이언트 사용 (순환 호출 방지) */
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

interface FailedQueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

// 401 에러(인증 실패) 처리를 위한 핸들러
// 콜백만 호출하고 실제 행동은 상위(스토어/루트)로 전달하여 결합도 낮추기
// 이는 axios 레이어에서는 HTTP 요청/응답 처리, 앱 상위 레이어에서는 라우팅 등 비즈니스 로직 처리를 분리하기 위함
let onUnauthorized: ((message: string) => void) | null = null;

export function setUnauthorizedHandler(handler: (message: string) => void) {
  onUnauthorized = handler;
}

function processQueue(error: unknown | null, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }
    if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
}

function shouldSkipTokenRefresh(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/signup") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout")
  );
}

async function refreshAccessToken(): Promise<string> {
  const storedRefreshToken = await ensureRefreshTokenLoaded();
  if (!storedRefreshToken) {
    throw new Error("리프레시 토큰이 없습니다.");
  }

  const { data } = await refreshClient.post<RefreshTokenResponse>(
    "/auth/refresh",
    { refreshToken: storedRefreshToken },
  );

  await Promise.all([
    setAccessToken(data.accessToken),
    setRefreshToken(data.refreshToken),
  ]);

  return data.accessToken;
}

function notifyUnauthorized(error: AxiosError<{ message?: string }>) {
  const message = error.response?.data?.message ?? "로그인이 필요합니다.";
  onUnauthorized?.(message);
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
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    if (shouldSkipTokenRefresh(originalRequest.url)) {
      notifyUnauthorized(error);
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      await clearAuthTokens();
      notifyUnauthorized(error);
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await refreshAccessToken();
      processQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await clearAuthTokens();
      notifyUnauthorized(error);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
