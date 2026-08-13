import type { QueryClient } from "@tanstack/react-query";

import { withdraw } from "@/src/api/auth/authApi.index";
import { clearAuthTokens } from "@/src/api/authToken";

export interface WithdrawUserOptions {
  queryClient?: QueryClient;
}

/**
 * 서버 회원탈퇴 요청 후 성공 시 로컬 토큰, 캐시를 정리
 */
export async function withdrawUser(
  options?: WithdrawUserOptions,
): Promise<void> {
  await withdraw();

  await clearAuthTokens();
  options?.queryClient?.clear();
}
