# 바로 시작하기

## 설치

이 폴더(`qa-harness`)를 **RUNSPOT_MOBILE 저장소 루트 안에** 두고 실행합니다.

```
RUNSPOT_MOBILE/
├─ app/
├─ src/
├─ package.json
└─ qa-harness/     ← 여기
   └─ install.sh
```

```bash
cd RUNSPOT_MOBILE
git checkout -b qa/harness
git add -A && git commit -m "wip"   # loop.sh 가 reset --hard 를 쓴다. 먼저 커밋할 것

chmod +x qa-harness/install.sh
./qa-harness/install.sh
```

설치기가 하는 일:

| 단계 | 내용 |
|---|---|
| 1 | 저장소 루트인지 확인, 커밋 안 된 변경 경고 |
| 2 | 하네스 파일 배치 (기존 파일은 `*.qa-bak` 으로 백업) |
| 3 | `package.json` 에 `typecheck` `test` `test:static` `verify` 스크립트 주입 |
| 4 | `.gitignore` 에 `.env` 추가 |
| 5 | `.env.example` → `.env` 복사 |
| 6 | `eas.json` 세 프로파일에 `env` 블록 추가 (값은 빈칸) |
| 7 | 테스트 의존성 6개 설치 |
| 8 | 정적 게이트 실행 |

기존 파일을 덮어쓰지 않고 백업합니다. 여러 번 돌려도 안전합니다.

## 설치 직후 — 빨간불이 정상입니다

마지막에 `npm run test:static` 이 **실패**합니다. 그게 맞습니다.

`tests/` 의 단언은 `main` 브랜치의 실제 결함을 고정한 것입니다.
캐시 키가 4형태로 쪼개져 있고, `eas.json` 에 env 값이 비어 있다고 잡힐 겁니다.

초록불이 나오면 오히려 문제입니다 — 스캐너가 결함을 못 잡고 있다는 뜻이니 루프를 켜지 마세요.

## 손으로 할 것 (5분)

설치기가 대신 못 하는 건 실제 값뿐입니다.

1. **`.env`** — `EXPO_PUBLIC_API_BASE_URL` 에 서버 주소.
   비어 있으면 `axiosInstance.ts` 가 모듈 로드 시점에 throw 해서 앱도 테스트도 안 돕니다.
2. **`eas.json`** — 세 프로파일의 `env` 값. `production` 의 `EXPO_PUBLIC_USE_MOCK` 은 반드시 `"false"`.
3. **`TASKS.md` 의 `QA-000` / `QA-001`** — 위 두 개를 끝냈으면 사실상 완료입니다.
   `[ ] TODO` 를 `[x] DONE` 으로 바꾸세요.

## 루프 실행

```bash
MAX_ITER=12 ./scripts/loop.sh
```

`TASKS.md` 맨 위 TODO 하나만 처리하고, `verify.sh` 가 통과해야 커밋합니다.
3회 실패하면 `BLOCKED.md` 에 원인을 쓰고 `reset --hard` 후 멈춥니다.

멈추면 `BLOCKED.md` 를 읽고 판단한 뒤, 내용을 비우고 다시 돌리면 이어서 갑니다.

## 매일 쓰는 명령

```bash
npm run test:static   # 몇 초. 캐시 키 · 환경변수 검사
npm run test:unit     # 순수 함수만
npm test              # 전체
npm run verify        # 배포 전 게이트 전부
```

## 시트

`docs/qa/qa-sheet.xlsx` — 4개 탭.

| 탭 | 언제 |
|---|---|
| 가이드 | 처음 한 번 |
| 결함목록 | 무엇이 왜 깨졌는지. 고칠 때마다 `상태` 를 OPEN → FIXED |
| QA시트 | 테스트 케이스 57건. `자동화` 가 `수동` 인 것만 사람이 확인 |
| 릴리스게이트 | 배포 직전. 차단 항목 하나라도 NG 면 배포 안 함 |

## E2E

`QA-009`(testID 부착)가 끝나기 전엔 아무것도 못 찾습니다. 현재 컴포넌트에 `testID` 가 거의 없습니다.

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
maestro test tests/e2e/full-flow.yaml -e HOST_ID=... -e MEMBER_ID=... -e PW=...
```

`full-flow.yaml` 은 호스트/참가자 기기 2대가 필요합니다.

## 되돌리기

```bash
git checkout main && git branch -D qa/harness
```

`*.qa-bak` 파일이 남아 있으면 그게 원본입니다.

## 막혔을 때

| 증상 | 원인 |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL is not set` | `.env` 가 비었습니다 |
| `Cannot find module 'jest-expo'` | 설치기 7단계가 실패했습니다. `npm i -D jest-expo` 직접 실행 |
| 네이티브 모듈 변환 에러 | `jest.config.js` 의 `transformIgnorePatterns` 에 해당 패키지 추가 |
| `loop.sh: .env 가 없다` | 1번 그대로 |
| 루프가 "완료"라는데 버그가 남음 | `./scripts/verify.sh` 가 exit 0 을 내는 것만이 완료입니다 |
