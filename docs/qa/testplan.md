# 테스트 계획

> RUNSPOT_MOBILE (Expo 54 / RN 0.81 / expo-router / TanStack Query / axios)
> 현재 저장소에 테스트는 **0개**다. CI에는 이슈 자동배정 워크플로만 있고 lint·typecheck 게이트조차 없다.
> 이 문서는 "뭘 짜면 좋을까"가 아니라 **머지 게이트로 세울 최소 집합**이다.

## 레벨

| 레벨 | 도구 | 대상 |
|---|---|---|
| 단위 | Jest (`jest-expo`) | `src/utils/*` 순수 함수 — pace, validation, datetime |
| 통합 | Jest + `axios-mock-adapter` | axios 인터셉터(401 재발급 큐), 토큰 저장소, 쿼리 키 |
| 컴포넌트 | `@testing-library/react-native` | create-session 폼 검증, 세션 상태별 버튼 노출 |
| E2E | **Maestro** (Playwright 불가 — RN 네이티브) | 로그인 → 개설 → 신청 → 승인 → 출석 → 평가 |

Playwright는 이 저장소에서 쓸 수 없다. `react-native-web`이 있지만 네이버 지도·SecureStore·위치 권한이 웹에서 안 돈다.
E2E는 Maestro로 EAS `development` 빌드 위에서 돌린다.

---

## ★★ 코드 읽으면서 실제로 찾은 결함 — 테스트는 여기부터 쓴다

아래 8개는 가정이 아니라 현재 `main`에서 확인된 것이다. **테스트를 먼저 실패시키고 고친다.**

### 1. 세션 상세가 캐시 키 3개로 쪼개져 있다 ★★

같은 리소스인데 화면마다 키가 다르다.

| 위치 | 키 |
|---|---|
| `session-detail.tsx:24` | `["session", "detail", sessionId]` |
| `attendance.tsx:52`, `manage-attendance.tsx:47`, `search.tsx:50` | `["sessionDetail", sessionId]` |
| `host-rating.tsx:45` | `["session", sessionId]` |

`attendance.tsx:109`가 `["sessionDetail", sessionId]`를 무효화해도 세션 상세 화면과 호스트 평가 화면은 **낡은 데이터를 그대로 들고 있다.**
출석 체크 → 뒤로가기 → 상세 화면이 갱신 안 되는 버그가 여기서 나온다.

```
tests/query-keys.test.ts
→ 저장소 전체를 스캔해서 queryKey 리터럴을 수집
→ 같은 sessionId 리소스를 가리키는 키가 2종류 이상이면 FAIL
```

**고칠 방향**: `src/api/session/session.keys.ts` 하나로 통일. `participantKeys` / `attendanceKey`처럼 팩토리만 쓰게 하고,
`queryKey: [` 리터럴 배열은 ESLint 커스텀 룰이나 위 테스트로 금지한다.

### 2. 페이스 파싱이 음수와 0을 통과시킨다 ★★

`src/utils/pace.ts` — 실제 실행 결과다.

| 입력 | 현재 결과 | 기대 |
|---|---|---|
| `"-01:30"` | `-30` | `null` |
| `"0:0"` | `0` | `null` |
| `"5abc:30"` | `330` | `null` |
| `"05:5"` | `305` | `null` (자릿수 미검증) |
| `"05:60"` | `null` | `null` ✅ |

`parseInt`가 `"5abc"`를 `5`로 읽고, 분(min)에는 하한 검사가 없다.
`create-session.tsx:191`은 `avgPaceSec: paceSec!`로 **검증 없이 그대로 전송**한다. 슬라이더는 clamp하지만 텍스트 입력 경로는 안 막힌다.
→ 서버에 `avgPaceSec: -30`이 들어간다.

### 3. `runType` / `genderPolicy`가 검증 없이 캐스팅된다 ★★

`create-session.tsx:183,193`:

```ts
runType: runType as RunType,          // 초기값 "" 인데 검사가 없다
genderPolicy: genderPolicy as GenderPolicy,
```

`handleSubmit`의 `next` 검증 블록에 이 두 필드가 **아예 없다.** 드래프트 초기값은 `""`.
셀렉트를 안 건드리고 제출하면 `runType: ""`이 서버로 간다. 타입스크립트는 `as` 때문에 조용하다.

```
tests/create-session.form.test.tsx
→ 제목·페이스·일정·인원·좌표·폴리라인만 채우고 제출
→ createSession 이 호출되면 FAIL (지금은 호출된다)
```

### 4. 401 재발급 큐에 `_retry` 플래그가 안 붙는다 ★★

`axiosInstance.ts:127-137`. 재발급 중 들어온 요청은 `failedQueue`에 쌓였다가 새 토큰으로 재시도되는데,
이때 `originalRequest._retry = true`를 **세팅하지 않는다.**

새 액세스 토큰마저 401이면(서버 롤백, 클럭 스큐, 리프레시 재사용 감지) 큐에 있던 요청들이 `_retry` 없이 다시 인터셉터에 진입한다.
→ 재발급 → 401 → 재발급 루프.

```ts
// tests/auth-refresh.test.ts
it("재발급 후에도 401이면 각 요청은 정확히 1회만 재시도된다", async () => {
  // /auth/refresh 는 항상 200, 보호 API 는 항상 401
  await Promise.allSettled([api.get("/a"), api.get("/b"), api.get("/c")]);
  expect(refreshCallCount).toBe(1);   // 지금 여기서 터진다
  expect(protectedCallCount).toBe(6); // 최초 3 + 재시도 3
});
```

**같은 파일에서 반드시 같이 검증할 것 (원자성 — 가장 중요):**

```
동시에 5개 요청이 401 → /auth/refresh 호출은 정확히 1회
→ 5개 전부 새 토큰으로 재시도되어 성공
→ isRefreshing 플래그가 finally 에서 반드시 false 로 복구
```

이게 깨지면 앱을 백그라운드에서 복귀시킬 때마다 재발급이 N번 날아가고, 서버가 리프레시 토큰 회전을 쓰면 **로그인이 통째로 풀린다.**

### 5. 401 리다이렉트가 Query 캐시를 안 지운다 — 계정 간 데이터 누출 ★★

| 경로 | 토큰 삭제 | Query 캐시 삭제 |
|---|---|---|
| `logoutUser()` | ✅ | ✅ `queryClient.clear()` |
| 인터셉터 → `onUnauthorized` → `_layout.tsx:20` | ✅ (일부 경로만) | ❌ **없음** |

`_layout.tsx`의 핸들러는 `router.replace("/(auth)/login")`만 한다.
A 계정이 401로 튕긴 뒤 B 계정으로 로그인하면 `["myPage","profile"]` 등이 캐시에 살아 있어 **A의 프로필이 잠깐 보인다.**

추가로 `shouldSkipTokenRefresh` 경로(login/signup/refresh/logout의 401)는 `clearAuthTokens()`를 호출하지 않는다.

```
tests/session-leak.test.ts
→ A 로그인 → myPage 쿼리 캐시 채움 → 401 유발
→ queryClient.getQueryCache().getAll().length === 0
→ getAccessToken() === null && SecureStore 에도 없음
```

### 6. 부트스트랩이 네비게이션마다 재실행된다 ★

`_layout.tsx:44` — `useEffect`의 deps에 `segments`가 있다.
화면을 옮길 때마다 `hydrateAccessToken()` + `hydrateRefreshToken()`(SecureStore 디스크 I/O 2회)가 다시 돈다.
`authReady`는 이미 true라 UI는 안 멈추지만, 느린 기기에서 `token`이 아직 null인 순간 `router.replace("/(auth)/login")`이 튀어 **정상 로그인 상태에서 로그인 화면으로 쫓겨나는** 레이스가 있다.

```
tests/bootstrap.test.tsx
→ 라우트 3번 이동 → SecureStore.getItemAsync 호출 횟수 === 2 (최초 1회분만)
```

### 7. 환경변수가 어디에도 없다 — 클린 클론으로 앱이 안 켜진다 ★★

`axiosInstance.ts:14`는 모듈 로드 시점에 **throw** 한다.

```ts
if (!API_BASE_URL) throw new Error("EXPO_PUBLIC_API_BASE_URL is not set");
```

그런데:

| 확인 | 결과 |
|---|---|
| `eas.json`의 `production` 프로파일 `env` 블록 | **없음** |
| `preview` / `development` 프로파일 `env` | **없음** |
| 저장소에 커밋된 `.env` | **없음** |
| `.gitignore`에 `.env` | **없음** (즉 의도적으로 뺀 게 아니라 그냥 없다) |
| `.env.example` | **없음** |

→ 신규 팀원이 클론하면 앱이 즉시 죽는다. 원인 메시지도 스택 최상단에만 뜬다.
→ EAS `production` 빌드를 지금 돌리면 **스토어에 올라간 앱이 실행 즉시 크래시**한다.
→ `EXPO_PUBLIC_NAVER_MAP_CLIENT_ID`도 마찬가지라 지도가 빈 화면이 된다.

`tests/env-guard.test.ts`가 이걸 CI에서 잡는다. 같이 할 일:
`.env.example` 추가, `.gitignore`에 `.env` 추가, `eas.json` 세 프로파일 전부에 `env` 블록 명시.

### 8. `mapMarkers` 캐시 키가 객체다 ★

`search.tsx:43` — `queryKey: ["mapMarkers", bounds]`.
`bounds`는 지도 팬마다 새로 만들어지는 객체다. 직렬화 키가 매번 달라져 **캐시 엔트리가 무한히 쌓인다.** `gcTime` 기본 5분 동안 수백 개.
좌표를 소수점 3~4자리로 양자화해서 키를 만들어야 한다.

```
tests/map-cache.test.ts
→ 0.00001 도 차이로 20번 팬 → 캐시 엔트리 ≤ 3
```

---

## 단위 테스트 — 표로 못 박는다

### `tests/pace.test.ts`

| 입력 | 기대 |
|---|---|
| `"06:00"` | `360` |
| `"05:60"` | `null` |
| `"-01:30"` | `null` ← 현재 `-30` |
| `"0:0"` | `null` ← 현재 `0` |
| `"5abc:30"` | `null` ← 현재 `330` |
| `"05:5"` | `null` ← 현재 `305` |
| `"  06 : 00  "` | `360` (공백 제거 스펙) |
| `secondsToPaceString(360)` | `"06:00"` |
| `secondsToPaceString(-30)` | 던지거나 `null` — 현재 `"-1:-30"` |
| `formatPaceDisplay("0530")` | `"05:30"` |
| `formatPaceDisplay("05")` | `"05:"` |

왕복 성질: 임의의 `120 ≤ s ≤ 900`에 대해 `paceStringToSeconds(secondsToPaceString(s)) === s`.

### `tests/validation.test.ts`

| 함수 | 케이스 | 기대 |
|---|---|---|
| `isEmpty` | `undefined` | `true` ← 현재 `false` |
| `isEmpty` | `""` / `"   "` | `true` |
| `isEmpty` | `0` | `false` (숫자 0은 빈 값 아님) |
| `matchAlphaNum` | `"abc 123"` | `false` |
| `matchAlphaNum` | `"한글"` | `false` |
| `matchAlphaNum` | `""`, minLen 0 | `false` (`+` 패턴상 빈 문자열 불가 — 스펙 명시) |
| `isValidPassword` | `"password"` | `false` (숫자 없음) |
| `isValidPassword` | `"a1!@#$%^"`, 8 | `true` |
| `isInRange1To7` | `" 3 "` | 스펙 확정 필요 — 현재 `true` |
| `isInRange1To7` | `"3.0"` | 현재 `true` |
| `areEqual` | `null` vs `""` | `true` (의도한 동작인지 확정) |

`isEmpty(undefined)`가 `false`인 게 특히 위험하다. `create-session`은 항상 `.trim()`을 걸어 넘겨서 지금은 안 터지지만,
API 응답에서 온 `undefined`를 그대로 넣는 호출부가 하나만 생겨도 검증이 통째로 뚫린다.

### `tests/datetime.test.ts`

`src/utils/datetime.ts`는 함수가 12개인데 전부 로컬 타임존 의존이다. **`TZ=Asia/Seoul`과 `TZ=UTC` 양쪽에서 돌린다.**

| 함수 | 케이스 | 기대 |
|---|---|---|
| `resolveEffectiveMinimumDate` | `minimumDate` 없음 + `leadMs=0` | `undefined` |
| `resolveEffectiveMinimumDate` | 과거 `minimumDate` + `leadMs=20분` | `now+20분` 쪽 |
| `formatLocalIsoDateTime` | `2026-03-01T00:00` | `"2026-03-01T00:00:00"` (UTC 변환 없음) |
| `parseValueToDate` | `"쓰레기"` | 현재 시각 폴백 |
| `clampDateTimePartsToMinimum` | 최소보다 이른 시각 | 최소 시각으로 당겨짐 |
| `htmlTimeMinFromMinimum` | 다른 날짜 | `undefined` |
| `splitDateAndTimeFromValue` | `""` | `{date:"", time:""}` |

`validateStartAtTiming` (create-session 내부)도 여기서 같이 본다: **정확히 `now+20분`인 경계값**은 `<` 비교라 통과해야 한다.
`jest.useFakeTimers()`로 고정하고 `now+20분-1ms` → 에러, `now+20분` → 통과.

---

## 세션 상태 머신 — 백엔드와 어긋나면 여기서 잡는다

`RunningStatus = OPEN | CLOSED | IN_PROGRESS | FINISHED`

| 상태 | 호스트에게 보여야 할 것 | 참가자에게 |
|---|---|---|
| `OPEN` | 신청 관리, 마감, 시작 | 신청하기 |
| `CLOSED` | 시작, 참가자 관리 | 신청 불가(마감 표기) |
| `IN_PROGRESS` | 종료, 출석 관리, **강퇴** | 나가기 |
| `FINISHED` | 참가자 평가 | 호스트 평가 |

`tests/session-state.test.tsx` — 4개 상태 × 2개 역할 = **8케이스 전수**. 각 케이스에서 노출되면 안 되는 버튼이 없는지 단언한다.

- **강퇴는 `IN_PROGRESS`에서만.** `OPEN`/`FINISHED`에서 `kickOutParticipant` 버튼이 보이면 FAIL.
- `FINISHED`에서 `startSession` / `finishSession` 호출 경로가 살아 있으면 FAIL.
- 정원(`capacity`) 도달 시 `joinSession` 버튼 비활성.
- `genderPolicy`가 `FEMALE_ONLY`인데 `MALE` 계정에 신청 버튼이 보이면 FAIL.

---

## 타입 정합성 — 지금 깨져 있다

| 항목 | `types/api/auth.ts` | `types/api/mypage.ts` |
|---|---|---|
| `AgeGroup` | `10S~60S` | `10S~50S` — **60S 없음** |
| `Gender` | 정의됨 | **중복 정의** |
| `GenderPolicy` | `createSession.ts` | `types/search/search.ts` — **중복** |

60대 사용자가 가입하면 마이페이지 타입에서 빠진다.
`tests/types.test-d.ts` (`tsd` 또는 `expectTypeOf`)로 중복 정의 3쌍이 서로 할당 가능한지 단언하고, 단일 소스로 합친다.

---

## E2E (Maestro) — `tests/e2e/*.yaml`

네이버 지도와 위치 권한 때문에 시뮬레이터 기본 좌표를 서울로 고정하고 시작한다.

### `full-flow.yaml` ★★ — 호스트 1 + 참가자 1, 기기 2대

```
[호스트] 로그인 → 러닝 코스 그리기(포인트 3개) → 세션 개설
[참가자] 검색 → 마커 탭 → 상세 → 신청(메시지 입력)
[호스트] 참가자 관리 → 승인 → 마감 → 시작
[호스트] 출석 관리 → 참가자 ATTENDED 처리
[호스트] 종료 → 참가자 평가 제출
[참가자] 호스트 평가 제출 → 마이페이지에 지난 러닝으로 노출 확인
```

**이 흐름 하나가 `docs/` 없는 이 저장소의 유일한 명세다.** 우선순위 1번.

### `token-refresh.yaml` ★★

```
로그인 → 액세스 토큰만 만료시킴(디버그 훅 또는 서버 짧은 TTL)
→ 마이페이지 진입 → 로그인 화면으로 안 튕기고 데이터가 뜨는지
→ 리프레시까지 만료 → 이번엔 로그인 화면으로 정확히 1회 이동
```

### `offline.yaml`

```
기내 모드 ON → 검색 진입
→ 무한 스피너가 아니라 에러 상태 + 재시도 버튼
→ 기내 모드 OFF → 재시도 → 정상 로드
```

`QueryClient`에 `defaultOptions`가 전혀 없다. 기본 `retry: 3` + `timeout: 10000` 조합이면 오프라인에서 **최대 40초 스피너**다.
`retry`와 `networkMode`를 명시하고 이 테스트로 잠근다.

### `permission-denied.yaml`

```
위치 권한 거부 → Alert 1회 → 전국 지도(36.5, 127.5, zoom 6) 폴백
→ 앱을 다시 켜도 Alert 이 매번 뜨지 않는지 (현재 매번 뜬다 — 스펙 확정 필요)
```

---

## 릴리스 게이트 — 이건 테스트가 아니라 사고 방지

### `EXPO_PUBLIC_USE_MOCK` + 환경변수 부재 ★★

API 모듈 9개가 전부 `*.index.ts`에서 이 값으로 목/실서버를 가른다.

```ts
const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";
```

이게 `true`인 채로 EAS `production` 빌드가 나가면 **가짜 데이터가 그대로 출시된다.** 런타임에 티도 안 난다.

```
tests/env-guard.test.ts
→ eas.json 의 production 프로파일에 EXPO_PUBLIC_USE_MOCK !== "true"
→ EXPO_PUBLIC_API_BASE_URL 이 https 이고 localhost/ngrok 이 아님
→ EXPO_PUBLIC_NAVER_MAP_CLIENT_ID 존재
```

여기에 **결함 7(환경변수 부재)** 검증이 같이 들어간다. CI에서 `production` 빌드 직전에 무조건 돌린다.

### CI에 게이트가 없다

`.github/workflows/`에는 이슈 자동배정·자동종료만 있다. lint도 typecheck도 PR에서 안 돈다.
husky + lint-staged는 로컬 훅이라 `--no-verify` 한 번이면 끝이고, CI에서는 아예 안 돈다.

→ `.github/workflows/qa.yml`로 `tsc --noEmit` + `eslint` + `jest`를 필수 체크로 건다.

---

## 실행

```bash
npm i -D jest jest-expo @testing-library/react-native @testing-library/jest-native \
        axios-mock-adapter @types/jest

npm run test              # 전체
npm run test:unit         # src/utils 만 — 가장 빠름
TZ=UTC npm run test:unit  # 타임존 회귀
maestro test tests/e2e/   # 디바이스 필요
```

---

## 우선순위

| 순서 | 항목 | 이유 |
|---|---|---|
| 1 | `tests/auth-refresh.test.ts` | 깨지면 로그인이 통째로 풀린다 |
| 2 | `tests/query-keys.test.ts` | 화면 3곳이 서로 다른 진실을 본다 |
| 3 | `tests/pace.test.ts` + create-session 폼 | 음수·빈 enum 이 서버로 나간다 |
| 4 | `.github/workflows/qa.yml` | 게이트 없으면 위 3개도 곧 썩는다 |
| 5 | `tests/env-guard.test.ts` | 지금 production 빌드하면 실행 즉시 크래시한다 |
| 6 | `tests/session-leak.test.ts` | 계정 간 데이터 누출 |
| 7 | `e2e/full-flow.yaml` | 저장소의 유일한 실행 가능 명세 |
| 8 | 나머지 단위 · 타입 정합성 | |
