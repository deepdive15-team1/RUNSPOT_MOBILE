import type { QueryClient } from "@tanstack/react-query";

import { logout } from "@/src/api/auth/authApi.index";
import { clearAuthTokens, ensureRefreshTokenLoaded } from "@/src/api/authToken";

export interface LogoutUserOptions {
  queryClient?: QueryClient;
}

/**
 * 서버 로그아웃 후 로컬 토큰·캐시를 정리
 * 서버 호출이 실패해도 로컬 세션은 반드시 삭제
 */
export async function logoutUser(options?: LogoutUserOptions): Promise<void> {
  try {
    const refreshToken = await ensureRefreshTokenLoaded();
    if (refreshToken) {
      await logout({ refreshToken });
    }
  } catch {
    // 서버 실패 시에도 로컬 세션은 정리
  } finally {
    await clearAuthTokens();
    options?.queryClient?.clear();
  }
}
