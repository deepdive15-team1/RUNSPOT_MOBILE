# 루프 운영 가이드

## 🚨 루프를 켜기 전에 사람이 해야 할 것

1. `git checkout -b qa/harness && git add -A && git commit -m "qa: harness"` (실패 시 `reset --hard` 한다)
2. **테스트 의존성 설치**
   ```bash
   npm i -D jest jest-expo @testing-library/react-native @testing-library/jest-native \
           axios-mock-adapter @types/jest
   ```
3. **`package.json`에 스크립트 추가** — 없으면 `verify.sh`가 첫 줄에서 죽는다
   ```json
   "typecheck": "tsc --noEmit",
   "test": "jest",
   "test:static": "jest tests/query-keys.test.ts tests/env-guard.test.ts"
   ```
4. **`.env` 생성** — `.env.example`을 복사해 실제 값을 채운다 ★
   `axiosInstance.ts`는 `EXPO_PUBLIC_API_BASE_URL`이 없으면 모듈 로드 시점에 throw한다.
   이게 없으면 앱도 테스트도 아무것도 안 돈다.
5. **`npm run test:static`을 직접 한 번 돌려본다** ★
   RN 런타임이 필요 없어서 몇 초면 끝난다. 여기서 빨간불이 뜨는 게 정상이다 —
   **빨간불이 안 뜨면 테스트가 결함을 못 잡고 있다는 뜻이니, 루프를 켜지 마라.**

## 실행

```bash
MAX_ITER=12 ./scripts/loop.sh
```

## 루프 계약

```
BLOCKED.md 비었나? → 아니면 정지
TODO 있나?        → 없으면 완료
  ↓
claude -p "/next-task"      ← 새 컨텍스트. --continue 안 씀
  ↓
./scripts/verify.sh         ← ★ 독립 검증. 에이전트 주장 무시
  ├ 실패 → /fix-verify (최대 3회)
  └ 3회 실패 → /give-up → BLOCKED → git reset --hard → 정지
  ↓
통과 → git commit → 다음
```

## 이 루프가 다른 이유

일반 개발 루프는 **없는 걸 만든다**. 이 루프는 **있는 걸 고친다.**
그래서 게이트의 성격이 반대다.

| 개발 루프 | QA 루프 |
|---|---|
| 테스트가 통과하면 성공 | **테스트가 빨간불로 시작하는 게 정상** |
| 에이전트가 테스트도 같이 쓴다 | **테스트는 이미 있고, 건드리면 죽는다** |
| 스펙이 문서에 있다 | **스펙이 `qa-sheet.xlsx`의 "기대결과" 칸에 있다** |

에이전트가 가장 쉽게 빠지는 함정: `expect(paceStringToSeconds("-01:30")).toBeNull()`이
실패하니까 **단언을 `toBe(-30)`으로 바꿔서** 초록불을 만드는 것.
`verify.sh`의 게이트 무결성 검사가 이걸 막는다.

## 루프에 넣지 말 것

| ✅ 넣어도 됨 | ❌ 넣지 마라 |
|---|---|
| 순수 함수 (pace, validation, datetime) | **실기기 지도 렌더링 확인** ← 사람 눈 |
| 쿼리 키 통일 · 캐시 무효화 | Maestro E2E 실행 (기기 필요) |
| 401 재발급 큐 · 토큰 정리 | 스펙 결정 (60S 포함 여부, 페이스 하한) |
| 타입 중복 통합 | `.env` 실제 값 · EAS 시크릿 |
| `testID` 부착 | 백엔드와 상태 머신 합의 |

> **`QA-009`(testID 부착)까지 끝나도 E2E는 사람이 기기에 물려 돌려야 한다.**
> 루프가 초록불을 냈다고 앱이 실제로 동작한다는 뜻이 아니다.
> M1이 끝나면 반드시 사람이 실기기에서 `full-flow.yaml`을 한 번 돌려라.
