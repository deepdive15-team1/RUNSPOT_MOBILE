import {
  login as realLogin,
  logout as realLogout,
  refresh as realRefresh,
  signup as realSignup,
} from "@/src/api/auth/authApi";
import {
  login as mockLogin,
  logout as mockLogout,
  refresh as mockRefresh,
  signup as mockSignup,
} from "@/src/api/auth/authApi.mock";

const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

/**
 * 회원가입.
 * @param requestBody - 회원가입 요청 본문
 * @returns 생성된 사용자 userId
 */
export const signup = isMock ? mockSignup : realSignup;

/**
 * 로그인.
 * @param requestBody - 로그인 요청 본문
 * @returns 사용자 정보 및 JWT 토큰
 */
export const login = isMock ? mockLogin : realLogin;

/**
 * 토큰 재발급.
 * @param requestBody - 리프레시 토큰
 * @returns 새 액세스·리프레시 토큰
 */
export const refresh = isMock ? mockRefresh : realRefresh;

/**
 * 로그아웃.
 * @param requestBody - 무효화할 리프레시 토큰
 * @returns 로그아웃 결과 메시지
 */
export const logout = isMock ? mockLogout : realLogout;
