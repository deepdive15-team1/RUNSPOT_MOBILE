import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

/** 런타임(메모리) 캐시 토큰: axios 요청 인터셉터에서 즉시 사용 */
let accessToken: string | null = null;
let refreshToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

/** 토큰을 메모리와 SecureStore에 함께 저장. null 전달 시 삭제 */
export async function setAccessToken(token: string | null): Promise<void> {
  accessToken = token;

  if (!token) {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    return;
  }

  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

/** 리프레시 토큰을 메모리와 SecureStore에 함께 저장. null 전달 시 삭제 */
export async function setRefreshToken(token: string | null): Promise<void> {
  refreshToken = token;

  if (!token) {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    return;
  }

  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

/** 액세스·리프레시 토큰을 메모리와 SecureStore에서 함께 삭제합니다. */
export async function clearAuthTokens(): Promise<void> {
  await setAccessToken(null);
  await setRefreshToken(null);
}

/** 앱 시작 시 SecureStore에서 토큰을 복원해 메모리에 적재 */
export async function hydrateAccessToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  accessToken = token;
  return token;
}

/** 앱 시작 시 SecureStore에서 리프레시 토큰을 복원해 메모리에 적재 */
export async function hydrateRefreshToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  refreshToken = token;
  return token;
}

/** 메모리에 없으면 SecureStore에서 리프레시 토큰을 읽어 적재 */
export async function ensureRefreshTokenLoaded(): Promise<string | null> {
  if (refreshToken) return refreshToken;
  return hydrateRefreshToken();
}
