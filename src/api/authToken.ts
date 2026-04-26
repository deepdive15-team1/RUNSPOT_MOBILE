import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "accessToken";

/** 런타임(메모리) 캐시 토큰: axios 요청 인터셉터에서 즉시 사용 */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * 토큰을 메모리와 SecureStore에 함께 저장합니다.
 * null 전달 시 저장된 토큰을 삭제합니다.
 */
export async function setAccessToken(token: string | null): Promise<void> {
  accessToken = token;

  if (!token) {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    return;
  }

  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

/** 앱 시작 시 SecureStore에서 토큰을 복원해 메모리에 적재합니다. */
export async function hydrateAccessToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  accessToken = token;
  return token;
}
