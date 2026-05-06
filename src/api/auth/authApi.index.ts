import {
  login as realLogin,
  logout as realLogout,
  signup as realSignup,
} from "@/src/api/auth/authApi";
import {
  login as mockLogin,
  logout as mockLogout,
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
 * @returns 사용자 정보
 */
export const login = isMock ? mockLogin : realLogin;

/**
 * 로그아웃.
 * @returns {Promise<void>} 로그아웃 성공 여부
 */
export const logout = isMock ? mockLogout : realLogout;
