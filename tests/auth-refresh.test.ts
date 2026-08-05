/* eslint-disable @typescript-eslint/no-require-imports */
import MockAdapter from "axios-mock-adapter";

/**
 * ★★ 이 파일이 이 저장소에서 가장 중요한 테스트다.
 *
 * axiosInstance 와 refreshClient 는 모듈 로드 시점에 axios.create() 로 만들어지고,
 * isRefreshing / failedQueue 는 모듈 스코프 변수다.
 * 따라서 (1) MockAdapter 를 axios 기본값에 먼저 심고 (2) 매 테스트마다 모듈을 새로 로드한다.
 */

const BASE = "https://test.invalid";

interface Harness {
  api: import("axios").AxiosInstance;
  mock: MockAdapter;
  setAccessToken: (t: string | null) => Promise<void>;
  setRefreshToken: (t: string | null) => Promise<void>;
  getAccessToken: () => string | null;
  setUnauthorizedHandler: (h: (m: string) => void) => void;
}

function loadHarness(): Harness {
  jest.resetModules();

  let harness!: Harness;
  jest.isolateModules(() => {
    // ★ 순서가 전부다.
    //   axios 를 격리된 레지스트리 "안에서" 먼저 require 해서 어댑터를 심고,
    //   그 다음에 axiosInstance 를 require 해야 같은 axios 를 쓴다.
    //   바깥에서 import 한 axios 에 MockAdapter 를 붙이면 다른 모듈 인스턴스라
    //   실제 네트워크로 나가서 Network Error 가 난다.
    //   refreshClient 는 export 되지 않으므로 axios.defaults 경유가 유일한 방법이다.
    const axiosMod = require("axios");
    const axiosRoot = axiosMod.default ?? axiosMod;
    const mock = new MockAdapter(axiosRoot);

    const instanceModule = require("@/src/api/axiosInstance");
    const tokenModule = require("@/src/api/authToken");
    harness = {
      api: instanceModule.axiosInstance,
      mock,
      setUnauthorizedHandler: instanceModule.setUnauthorizedHandler,
      setAccessToken: tokenModule.setAccessToken,
      setRefreshToken: tokenModule.setRefreshToken,
      getAccessToken: tokenModule.getAccessToken,
    };
  });
  return harness;
}

describe("401 → 토큰 재발급", () => {
  let h: Harness;

  beforeEach(async () => {
    h = loadHarness();
    await h.setAccessToken("expired-access");
    await h.setRefreshToken("valid-refresh");
  });

  afterEach(() => {
    h.mock.restore();
  });

  it("★★ 동시에 5개가 401 나도 /auth/refresh 는 정확히 1회만 호출된다", async () => {
    let refreshCalls = 0;
    let protectedCalls = 0;

    h.mock.onPost(`${BASE}/auth/refresh`).reply(() => {
      refreshCalls += 1;
      return [
        200,
        { accessToken: "fresh-access", refreshToken: "fresh-refresh" },
      ];
    });

    h.mock.onGet(/\/protected\/\d/).reply((config) => {
      protectedCalls += 1;
      const auth = config.headers?.Authorization;
      return auth === "Bearer fresh-access" ? [200, { ok: true }] : [401, {}];
    });

    const results = await Promise.all([
      h.api.get("/protected/1"),
      h.api.get("/protected/2"),
      h.api.get("/protected/3"),
      h.api.get("/protected/4"),
      h.api.get("/protected/5"),
    ]);

    // 재발급은 단 1회 — 깨지면 서버가 리프레시 회전 시 로그인이 통째로 풀린다
    expect(refreshCalls).toBe(1);
    // 최초 5회(401) + 재시도 5회(200)
    expect(protectedCalls).toBe(10);
    expect(results.every((r) => r.status === 200)).toBe(true);
    expect(h.getAccessToken()).toBe("fresh-access");
  });

  it("★★ 재발급 후에도 401이면 각 요청은 정확히 1회만 재시도한다 (무한루프 방지)", async () => {
    let refreshCalls = 0;
    let protectedCalls = 0;

    h.mock.onPost(`${BASE}/auth/refresh`).reply(() => {
      refreshCalls += 1;
      return [
        200,
        { accessToken: `access-${refreshCalls}`, refreshToken: "r" },
      ];
    });
    // 새 토큰이어도 계속 401 (서버 롤백 / 클럭 스큐 / 리프레시 재사용 감지)
    h.mock.onGet(/\/protected\/\d/).reply(() => {
      protectedCalls += 1;
      return [401, {}];
    });

    await Promise.allSettled([
      h.api.get("/protected/1"),
      h.api.get("/protected/2"),
      h.api.get("/protected/3"),
    ]);

    // 현재 실패: 큐에 들어간 요청은 _retry 가 세팅되지 않아 재발급 루프에 다시 진입한다
    expect(refreshCalls).toBe(1);
    expect(protectedCalls).toBe(6); // 최초 3 + 재시도 3
  });

  it("재발급이 실패하면 토큰을 지우고 onUnauthorized 를 정확히 1회 호출한다", async () => {
    const onUnauthorized = jest.fn();
    h.setUnauthorizedHandler(onUnauthorized);

    h.mock.onPost(`${BASE}/auth/refresh`).reply(401, {});
    h.mock.onGet("/protected/1").reply(401, { message: "만료되었습니다." });

    await expect(h.api.get("/protected/1")).rejects.toBeDefined();

    expect(h.getAccessToken()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("재발급 실패 시 큐에 대기 중이던 요청도 전부 reject 된다 (매달리지 않는다)", async () => {
    h.mock.onPost(`${BASE}/auth/refresh`).reply(() => {
      // 큐가 쌓일 시간을 준다
      return new Promise((resolve) => setTimeout(() => resolve([401, {}]), 20));
    });
    h.mock.onGet(/\/protected\/\d/).reply(401, {});

    const settled = await Promise.allSettled([
      h.api.get("/protected/1"),
      h.api.get("/protected/2"),
      h.api.get("/protected/3"),
    ]);

    expect(settled.every((s) => s.status === "rejected")).toBe(true);
  });

  it("login/signup/refresh/logout 의 401은 재발급을 시도하지 않는다", async () => {
    let refreshCalls = 0;
    h.mock.onPost(`${BASE}/auth/refresh`).reply(() => {
      refreshCalls += 1;
      return [200, { accessToken: "a", refreshToken: "r" }];
    });
    h.mock
      .onPost(`${BASE}/auth/login`)
      .reply(401, { message: "비밀번호 오류" });

    await expect(
      h.api.post("/auth/login", { username: "u", password: "p" }),
    ).rejects.toBeDefined();

    expect(refreshCalls).toBe(0);
  });

  it("리프레시 토큰이 없으면 재발급을 시도하지 않고 즉시 실패한다", async () => {
    await h.setRefreshToken(null);
    let refreshCalls = 0;
    h.mock.onPost(`${BASE}/auth/refresh`).reply(() => {
      refreshCalls += 1;
      return [200, {}];
    });
    h.mock.onGet("/protected/1").reply(401, {});

    await expect(h.api.get("/protected/1")).rejects.toBeDefined();
    expect(refreshCalls).toBe(0);
  });

  it("재발급 성공 후 isRefreshing 이 복구되어 다음 401도 처리된다", async () => {
    let refreshCalls = 0;
    h.mock.onPost(`${BASE}/auth/refresh`).reply(() => {
      refreshCalls += 1;
      return [
        200,
        { accessToken: `access-${refreshCalls}`, refreshToken: "r" },
      ];
    });
    h.mock.onGet("/protected/1").reply((config) => {
      const ok = String(config.headers?.Authorization ?? "").startsWith(
        "Bearer access-",
      );
      return ok ? [200, {}] : [401, {}];
    });

    await h.api.get("/protected/1");
    await h.setAccessToken("expired-again");
    await h.api.get("/protected/1");

    expect(refreshCalls).toBe(2); // 플래그가 false 로 안 돌아오면 2번째가 영원히 매달린다
  });

  it("401이 아닌 에러(500)는 재발급 없이 그대로 전파된다", async () => {
    let refreshCalls = 0;
    h.mock.onPost(`${BASE}/auth/refresh`).reply(() => {
      refreshCalls += 1;
      return [200, {}];
    });
    h.mock.onGet("/protected/1").reply(500, {});

    await expect(h.api.get("/protected/1")).rejects.toMatchObject({
      response: { status: 500 },
    });
    expect(refreshCalls).toBe(0);
  });
});

describe("콜드 스타트 레이스", () => {
  it("메모리에 액세스 토큰이 없어도 SecureStore 의 리프레시로 복구된다", async () => {
    const h = loadHarness();
    // hydrate 를 부르지 않은 상태 — 요청 인터셉터는 메모리만 본다
    await h.setRefreshToken("valid-refresh");
    await h.setAccessToken(null);

    h.mock
      .onPost(`${BASE}/auth/refresh`)
      .reply(200, { accessToken: "fresh", refreshToken: "fresh-r" });
    h.mock
      .onGet("/protected/1")
      .reply((config) =>
        config.headers?.Authorization === "Bearer fresh"
          ? [200, {}]
          : [401, {}],
      );

    const res = await h.api.get("/protected/1");
    expect(res.status).toBe(200);
    h.mock.restore();
  });
});
