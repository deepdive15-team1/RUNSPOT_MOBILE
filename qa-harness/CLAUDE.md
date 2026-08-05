# RUNSPOT_MOBILE — QA 하네스

러닝메이트 매칭 앱 (Expo 54 / RN 0.81 / expo-router / TanStack Query / axios / Naver Map).
**이 하네스의 목적은 기능 추가가 아니다. 테스트를 세우고, `docs/qa/qa-sheet.xlsx`에 적힌 결함을 없애는 것이다.**

---

## 🚨 불변 규칙 (어기면 즉시 중단)

1. **기능을 추가하지 마라.** 이 루프는 QA 루프다. 새 화면·새 API·새 라이브러리 금지.
   `TASKS.md`에 없는 건 하지 않는다. 필요하면 `BLOCKED.md`에 쓰고 멈춰라.

2. **`docs/qa/qa-sheet.xlsx`와 `docs/qa/testplan.md`가 단일 진실이다.**
   코드가 다르면 코드가 틀린 것이다. 시트의 기대결과를 바꾸려면 사람에게 물어라.

3. **실패하는 테스트를 통과시키려고 테스트를 고치지 마라.** ★
   `tests/` 안의 단언은 `main`의 실제 결함을 고정한 것이다. 빨간불은 버그가 살아있다는 뜻이고,
   초록불로 만드는 유일한 방법은 **`src/`와 `app/`을 고치는 것**이다.

4. **쿼리 키는 팩토리로만 만든다.** `queryKey: ["..."]` 리터럴 배열 금지.
   같은 리소스가 두 개의 키로 캐시되는 순간 `invalidateQueries`는 반쪽만 동작한다. → `QA-002`

5. **검증 함수는 값을 통과시키기 전에 범위를 확인한다.**
   `as RunType` 같은 캐스팅으로 타입 검사를 우회하지 마라. 캐스팅은 검증이 아니다. → `QA-003`

6. **토큰·인증 흐름을 손댈 땐 `tests/auth-refresh.test.ts`부터 돌려라.**
   401 재발급은 이 앱에서 가장 조용하게 깨지는 부분이다. 깨지면 유저가 이유 없이 로그아웃된다.

7. **`EXPO_PUBLIC_USE_MOCK`은 `src/api/**/*.index.ts` 밖에서 읽지 않는다.**
   이 값이 production 빌드에 `true`로 섞이면 가짜 데이터가 그대로 출시되고 런타임에 티도 안 난다.

8. **`console.log`를 남기지 마라.** 디버깅용이면 지우고 커밋해라.

---

## 📍 문서 라우팅 — 작업 전에 읽어라

| 작업 | 문서 |
|---|---|
| **무엇을 왜 고치는가** ★ | `docs/qa/qa-sheet.xlsx` — 결함 목록 + 테스트 케이스 |
| **테스트 전략·레벨·도구** ★ | `docs/qa/testplan.md` |
| 지금 어디까지 | `PROGRESS.md` ★ / `TASKS.md` ★ |
| 막혔을 때 | `BLOCKED.md`에 쓰고 종료 |
| 루프 운영 | `LOOP.md` |

> **이 파일에 결함 내용을 복붙하지 마라.** 여기는 라우터다.

---

## 🛠 스택 (변경 금지)

- Expo 54 / React Native 0.81 / TypeScript 5.9
- 라우팅: expo-router 6 (`app/(auth)`, `app/(main)`)
- 서버 상태: TanStack Query 5 / HTTP: axios (인터셉터로 401 재발급)
- 클라이언트 상태: zustand / 지도: `@mj-studio/react-native-naver-map`
- 저장소: expo-secure-store (토큰)
- 테스트: **Jest (`jest-expo`)** + `@testing-library/react-native` + `axios-mock-adapter`
- E2E: **Maestro** (Playwright 불가 — RN 네이티브)

```bash
npm run typecheck     # tsc --noEmit
npm run lint
npm run format:check
npm test
npm run test:static   # RN 런타임 불필요. 몇 초면 끝난다
./scripts/verify.sh   # ★ 완료의 유일한 정의
```

**패키지 매니저는 npm이다** (`package-lock.json`). pnpm/yarn으로 바꾸지 마라.

---

## ❌ 하지 말 것

- 테스트 `skip` / `only` / 삭제 / 단언 완화
- `any` · `@ts-ignore` · `@ts-expect-error` · `eslint-disable`로 게이트 덮기
- `as` 캐스팅으로 검증 우회
- `docs/` `tests/` `scripts/` 수정 (게이트다)
- 새 의존성 추가 (테스트 도구 제외, 그것도 `TASKS.md`에 있을 때만)
- 리팩터링 겸사겸사 — 태스크 하나에 파일 하나씩

---

## 🔁 LOOP MODE (`scripts/loop.sh`로 실행 중일 때)

| 대화형 | 루프 |
|---|---|
| "물어봐라" | **`BLOCKED.md` 쓰고 종료** |
| "완료했습니다" | **선언 금지.** `./scripts/verify.sh` exit 0 만이 완료 |
| 여러 태스크 | **금지.** `TASKS.md` 맨 위 TODO **하나만** |

### 🚨 부정행위 (하면 루프가 죽는다)

`verify.sh`가 `git diff`로 `tests/` `docs/` `scripts/`를 감시한다. 손대면 즉시 `reset --hard`다.

> 게이트를 통과하는 유일한 방법은 **버그를 실제로 고치는 것**이다.
> 못 하겠으면 BLOCKED다. **테스트를 무르게 만드는 것이 가장 나쁜 실패다.**

---

## 사람만 할 수 있는 것 (루프에 넣지 마라)

| ✅ 루프가 해도 됨 | ❌ 사람이 해야 함 |
|---|---|
| 순수 함수 검증 로직 수정 | **실기기에서 지도가 제대로 뜨는가** |
| 쿼리 키 통일 | 위치 권한 거부 시 Alert이 매번 뜨는 게 맞는지 **스펙 결정** |
| 401 재발급 큐 수정 | Maestro E2E 실행 (기기 필요) |
| 타입 중복 통합 | `.env` 실제 값 채우기 |
| 테스트 추가 | 백엔드와 세션 상태 머신 합의 |

`AgeGroup`에 `60S`가 있어야 하는지, 페이스 하한을 2:00으로 할지 3:00으로 할지는
**코드가 결정할 수 없다.** 그건 `BLOCKED.md`행이다.
