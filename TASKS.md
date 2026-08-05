# TASKS — 루프의 단일 작업 큐

> 루프는 **맨 위 TODO 하나만** 처리하고 종료한다.
> 상태: `TODO` → `DOING` → `DONE` / `BLOCKED`
> **에이전트는 자기 태스크의 상태 마커만 바꾼다. 새 태스크를 추가하지 않는다.**
> 각 태스크의 `sheet:` 는 `docs/qa/qa-sheet.xlsx`의 결함 ID다. 거기 "기대결과"가 스펙이다.

---

## M0 — 앱이 켜지게 만든다 (다른 건 아무것도 하지 않는다)

> **지금 클린 클론으로는 앱이 실행조차 안 된다.** 테스트도 못 돌린다.
> 여기가 안 끝나면 나머지 전부 무의미하다.

- [ ] TODO `QA-000` 테스트 하네스 부팅
  - `package.json`에 `typecheck` / `test` / `test:static` 스크립트 추가
  - `jest.config.js` + `tests/setup.ts`가 실제로 돌아가는지 확인
  - verify: `npm run typecheck && npm run test:static`이 **실행은 되는 것**(빨간불이어도 됨)
- [ ] TODO `QA-001` 환경변수 부재 — 클린 클론으로 앱이 안 켜짐  `sheet: BUG-007`
  - `.gitignore`에 `.env` 추가, `.env.example` 커밋
  - `eas.json`의 `development`/`preview`/`production` 세 프로파일 전부에 `env` 블록 명시
  - `axiosInstance.ts`의 throw는 **그대로 둔다** (조용히 죽는 것보다 낫다)
  - verify: `npm test -- tests/env-guard.test.ts` 통과

## M1 — 확인된 결함 제거 (M0 전부 DONE 전엔 손대지 않는다)

- [ ] TODO `QA-002` 세션 상세 캐시 키 3종 통일  `sheet: BUG-001`
  - `src/api/session/session.keys.ts` 신규 — `sessionKeys.detail(id)` 하나로
  - `session-detail.tsx` `attendance.tsx` `manage-attendance.tsx` `search.tsx` `host-rating.tsx` 전부 교체
  - `["mapMarkers", bounds]`는 좌표를 소수점 4자리로 양자화해 문자열 키로
  - verify: `npm test -- tests/query-keys.test.ts` 통과
- [ ] TODO `QA-003` 401 재발급 큐에 `_retry` 누락  `sheet: BUG-004`
  - `axiosInstance.ts`의 `failedQueue` 재시도 경로에서 `originalRequest._retry = true` 세팅
  - verify: `npm test -- tests/auth-refresh.test.ts` 전체 통과
- [ ] TODO `QA-004` 401 리다이렉트가 Query 캐시를 안 지움 — 계정 간 데이터 노출  `sheet: BUG-005`
  - `_layout.tsx`의 `setUnauthorizedHandler`에서 `queryClient.clear()` 호출
  - `shouldSkipTokenRefresh` 경로(login/signup/refresh/logout의 401)에서도 `clearAuthTokens()`
  - verify: `npm test -- tests/session-leak.test.ts` 통과
- [ ] TODO `QA-005` 페이스 파서가 음수·0·영숫자 혼합을 통과시킴  `sheet: BUG-002`
  - `paceStringToSeconds`에 `/^\d{1,2}:\d{2}$/` 형식 검사 + 범위 하한/상한
  - **범위 값은 시트의 "기대결과" 칸을 그대로 따른다.** 임의로 정하지 마라
  - `secondsToPaceString`도 음수 방어
  - verify: `npm test -- tests/pace.test.ts` 통과
- [ ] TODO `QA-006` `runType`/`genderPolicy`가 검증 없이 캐스팅됨  `sheet: BUG-003`
  - `create-session.tsx`의 `handleSubmit` 검증 블록에 두 필드 추가
  - `as RunType` / `as GenderPolicy` 캐스팅 제거 — 검증 통과 후 좁혀진 타입을 쓴다
  - verify: `npm test -- tests/create-session.form.test.tsx` 통과
- [ ] TODO `QA-007` `isEmpty(undefined)`가 `false`  `sheet: BUG-008`
  - `src/utils/validation.ts` 수정. 호출부 회귀 확인
  - verify: `npm test -- tests/validation.test.ts` 통과
- [ ] TODO `QA-008` 부트스트랩이 네비게이션마다 재실행됨  `sheet: BUG-006`
  - `_layout.tsx`의 `useEffect` deps에서 `segments` 제거, 리다이렉트 판단만 분리
  - verify: `npm test -- tests/bootstrap.test.tsx` 통과

## M2 — E2E 준비 (M1 전부 DONE 후)

- [ ] TODO `QA-009` 화면에 `testID` 부착
  - `tests/e2e/*.yaml`이 참조하는 id 전부 (`login-submit` `create-submit` `attendance-toggle-0` 등)
  - **화면 로직은 건드리지 마라.** `testID` prop만 추가한다
  - verify: `npm run typecheck && npm run lint`, 그리고 사람이 실기기에서 `full-flow.yaml` 실행
- [ ] TODO `QA-010` `QueryClient` 기본 옵션 명시
  - `retry` / `networkMode` / `staleTime` — 지금은 기본값이라 오프라인에서 최대 40초 스피너
  - verify: `npm test` 전체 통과
- [ ] TODO `QA-011` CI 게이트 추가
  - `.github/workflows/qa.yml` — `tsc --noEmit` + `eslint` + `jest` 필수 체크
  - verify: PR에서 세 잡이 전부 초록불

## BLOCKED — 사람의 결정이 필요하다 (루프가 손대면 안 됨)

- [ ] BLOCKED `QA-100` `AgeGroup`에 `60S`를 포함할 것인가  `sheet: BUG-009`
  `types/api/auth.ts`는 `10S~60S`, `types/api/mypage.ts`는 `10S~50S`.
  60대 가입자가 마이페이지 타입에서 빠진다. **백엔드 스펙 확인 필요.**
- [ ] BLOCKED `QA-101` 페이스 유효 범위를 얼마로 할 것인가  `sheet: BUG-002`
  슬라이더는 `02:00~15:00`으로 clamp하는데, 텍스트 입력은 무제한이다.
  둘을 맞출지, 텍스트 입력을 더 넓게 열지 **프로덕트 결정 필요.**
- [ ] BLOCKED `QA-102` 위치 권한 거부 Alert을 매 진입마다 띄울 것인가  `sheet: BUG-010`
  현재는 `search` 탭에 들어갈 때마다 뜬다. **UX 결정 필요.**
