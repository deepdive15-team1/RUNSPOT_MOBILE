# PROGRESS

## 현재 마일스톤

**M0 시작 전.** 하네스만 세워진 상태다.
`main` 코드를 읽고 확인한 결함 10건을 `docs/qa/qa-sheet.xlsx`에 기록했고,
그중 8건은 `tests/`에 실패하는 단언으로 고정해뒀다.

**아직 아무것도 고치지 않았다.** 테스트를 돌리면 빨간불이 나오는 게 정상이다.

## 상태

| 태스크 | 상태 | 비고 |
|---|---|---|
| `QA-000` 하네스 부팅 | ⬜ TODO | `package.json` 스크립트 3개 추가 필요 |
| `QA-001` 환경변수 부재 | ⬜ TODO | ★ 이게 안 되면 앱도 테스트도 안 돈다 |
| `QA-002` 캐시 키 통일 | ⬜ TODO | 스캐너로 4형태 확인됨 |
| `QA-003` 재발급 큐 `_retry` | ⬜ TODO | |
| `QA-004` 401 캐시 잔존 | ⬜ TODO | 계정 간 데이터 노출 |
| `QA-005` 페이스 파서 | ⬜ TODO | 음수·0 실행으로 재현 확인 |
| `QA-006` enum 캐스팅 | ⬜ TODO | |
| `QA-007` `isEmpty(undefined)` | ⬜ TODO | |
| `QA-008` 부트스트랩 재실행 | ⬜ TODO | |
| `QA-009` `testID` 부착 | ⬜ TODO | E2E 전제조건 |
| `QA-010` QueryClient 기본값 | ⬜ TODO | |
| `QA-011` CI 게이트 | ⬜ TODO | |
| `QA-100~102` | 🔒 BLOCKED | 사람의 스펙 결정 대기 |

## 하네스 실측 (설치기로 실제 실행한 결과)

Expo 54 저장소 복제본에 `install.sh` 를 돌리고 Jest 전체를 실행했다.

```
Test Suites: 5 failed, 5 total
Tests:       13 failed, 78 passed, 91 total
```

**13건 실패가 정상이다.** 전부 `main` 의 실제 결함을 고정한 단언이다.

설치 과정에서 드러난 것 (install.sh 에 반영 완료):

| 문제 | 조치 |
|---|---|
| `jest-expo@*` 가 57 로 잡혀 `react@^19.2.3` 요구 → ERESOLVE | `jest-expo@~54.0.17` 고정 |
| `react-test-renderer` 최신이 `react@^19.2.8` 요구 | `react-test-renderer@19.1.0` 고정 |
| `@testing-library/jest-native` deprecated | 제거 (RNTL 13 에 매처 내장) |
| `qa-harness/` 폴더가 남아 haste 중복 스캔 | `jest.config.js` 에 `modulePathIgnorePatterns` |

`BUG-004` 는 이제 추측이 아니라 실측이다 — 재발급 후에도 401 인 상황에서
`/auth/refresh` 호출이 **1회가 아니라 3회** 나갔다. 큐에 들어간 요청이 `_retry` 없이
인터셉터에 재진입한다는 증거다.

## 조사 기록 (루프 시작 전, 사람이 코드 읽고 확인한 것)

### 실행으로 재현한 것

`src/utils/pace.ts`의 `paceStringToSeconds`를 그대로 떼어 node로 실행한 결과:

| 입력 | 실제 반환 |
|---|---|
| `"-01:30"` | `-30` |
| `"0:0"` | `0` |
| `"5abc:30"` | `330` |
| `"05:5"` | `305` |

`create-session.tsx:191`이 `avgPaceSec: paceSec!`로 그대로 전송하므로,
서버에 음수 페이스가 들어간다. 슬라이더는 `02:00~15:00`으로 clamp하지만 텍스트 입력 경로는 안 막힌다.

`isEmpty(undefined)`도 `false`를 반환하는 것을 확인했다.

### 정적 스캔으로 확인한 것

저장소 전체의 `queryKey:` 리터럴을 스캔한 결과 **14건**이 나왔고,
그중 세션 상세를 가리키는 것이 **6곳 / 4형태**였다.

| 위치 | 키 |
|---|---|
| `session-detail.tsx:24` | `["session", "detail", sessionId]` |
| `attendance.tsx:52,109` | `["sessionDetail", sessionId]` |
| `manage-attendance.tsx:47` | `["sessionDetail", sessionId]` |
| `search.tsx:50` | `["sessionDetail", selectedSessionId]` |
| `host-rating.tsx:45` | `["session", sessionId]` |

`attendance.tsx:109`가 무효화하는 키는 이 중 하나뿐이라,
출석 체크 후 뒤로 나가면 상세 화면이 낡은 값을 보여준다.

`search.tsx:43`의 `["mapMarkers", bounds]`는 `bounds`가 지도 팬마다 새로 만들어지는 객체라
캐시 엔트리가 무한히 쌓인다.

### 파일 존재 여부로 확인한 것

| 확인 | 결과 |
|---|---|
| `eas.json`의 세 프로파일 `env` 블록 | 전부 없음 |
| 커밋된 `.env` | 없음 |
| `.gitignore`의 `.env` | 없음 |
| `.env.example` | 없음 |
| `.github/workflows/`의 lint·typecheck·test | 없음 (이슈 자동배정/자동종료만 있음) |
| 저장소 내 테스트 파일 | **0개** |

`axiosInstance.ts:14`가 `EXPO_PUBLIC_API_BASE_URL` 없으면 모듈 로드 시점에 throw하므로,
지금 EAS `production` 빌드를 돌리면 **스토어에 올라간 앱이 실행 즉시 크래시한다.**

## 알려진 이슈 / 후속 확인 필요

- **E2E는 아직 못 돌린다.** `tests/e2e/*.yaml`이 참조하는 `testID`가 화면에 거의 없다 (`QA-009`).
- `token-refresh.yaml`은 "액세스 토큰만 만료" 히든 메뉴 또는 짧은 TTL QA 서버가 필요하다.
  둘 다 없으면 이 시나리오는 수동으로도 재현이 어렵다.
- `src/hooks/search/useCurrentLocation.ts`의 Alert 반복 여부는 스펙이 없어 현재 동작만 기록해뒀다 (`QA-102`).
- 백엔드 세션 상태 머신(`OPEN → CLOSED/IN_PROGRESS → FINISHED`, 강퇴는 `IN_PROGRESS`에서만)은
  프론트 코드에서 역추적한 것이다. **백엔드 팀과 대조하지 않았다.**
- `docs/`가 이 저장소에 원래 없었다. `full-flow.yaml`이 사실상 유일한 실행 가능 명세다.

## 다음

1. `QA-000` → `QA-001` 순으로 M0를 끝낸다. 여기까지는 루프 없이 사람이 해도 된다.
2. `npm run test:static`으로 빨간불을 눈으로 확인한 뒤 루프를 켠다.
3. M1이 끝나면 사람이 실기기에서 `full-flow.yaml`을 한 번 돌린다.

## 열린 질문

- `QA-100` `AgeGroup`에 `60S` 포함 여부
- `QA-101` 페이스 유효 범위
- `QA-102` 위치 권한 Alert 반복 여부
