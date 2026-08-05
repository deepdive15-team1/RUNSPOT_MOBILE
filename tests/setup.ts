/**
 * axiosInstance 는 import 시점에 EXPO_PUBLIC_API_BASE_URL 을 읽고
 * 없으면 throw 한다. 테스트에서는 항상 고정값을 넣는다.
 */
process.env.EXPO_PUBLIC_API_BASE_URL = "https://test.invalid";
process.env.EXPO_PUBLIC_USE_MOCK = "false";

/** SecureStore 는 네이티브 모듈이라 인메모리로 대체 */
jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    __store: store,
    getItemAsync: jest.fn(async (k: string) => store.get(k) ?? null),
    setItemAsync: jest.fn(async (k: string, v: string) => {
      store.set(k, v);
    }),
    deleteItemAsync: jest.fn(async (k: string) => {
      store.delete(k);
    }),
  };
});

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({
    status: "granted",
  })),
  getLastKnownPositionAsync: jest.fn(async () => null),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: 37.5665, longitude: 126.978 },
  })),
  reverseGeocodeAsync: jest.fn(async () => []),
  Accuracy: { Balanced: 3 },
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useSegments: () => ["(main)"],
  useLocalSearchParams: () => ({}),
  Stack: ({ children }: { children?: unknown }) => children ?? null,
}));

afterEach(() => {
  jest.clearAllMocks();
});
