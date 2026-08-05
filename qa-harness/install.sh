#!/usr/bin/env bash
# RUNSPOT_MOBILE QA 하네스 설치기
# 사용법: 이 폴더를 RUNSPOT_MOBILE 저장소 루트에 두고  ./install.sh
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/.." && pwd)"

say()  { printf "\n\033[1;36m▸ %s\033[0m\n" "$1"; }
ok()   { printf "  \033[32m✓\033[0m %s\n" "$1"; }
warn() { printf "  \033[33m!\033[0m %s\n" "$1"; }
die()  { printf "\n\033[31m✗ %s\033[0m\n" "$1"; exit 1; }

# ── 0. 위치 확인 ────────────────────────────────────────
say "저장소 확인"
[ -f "$REPO/package.json" ] || die "$REPO 에 package.json 이 없습니다. 이 폴더를 RUNSPOT_MOBILE 루트 안에 두고 실행하세요."
NAME=$(node -p "require('$REPO/package.json').name" 2>/dev/null || echo "?")
if [ "$NAME" != "runspot_mobile" ]; then
  warn "package.json 의 name 이 '$NAME' 입니다 (기대: runspot_mobile)"
  read -r -p "  그래도 진행할까요? [y/N] " a; [ "$a" = "y" ] || die "중단했습니다."
fi
ok "저장소: $REPO"

command -v node >/dev/null || die "node 가 필요합니다."
command -v npm  >/dev/null || die "npm 이 필요합니다."

# ── 1. 커밋되지 않은 변경 확인 ──────────────────────────
say "작업 트리 확인"
if git -C "$REPO" rev-parse --git-dir >/dev/null 2>&1; then
  if ! git -C "$REPO" diff --quiet || ! git -C "$REPO" diff --cached --quiet; then
    warn "커밋되지 않은 변경이 있습니다."
    warn "loop.sh 는 실패 시 git reset --hard 를 실행합니다 — 지금 커밋하지 않으면 날아갑니다."
    read -r -p "  계속할까요? [y/N] " a; [ "$a" = "y" ] || die "중단했습니다. 먼저 커밋하세요."
  else
    ok "작업 트리 깨끗함"
  fi
else
  warn "git 저장소가 아닙니다. loop.sh 는 git 없이 동작하지 않습니다."
fi

# ── 2. 파일 배치 ────────────────────────────────────────
say "하네스 파일 배치"
copy() {  # copy <상대경로>
  local src="$HERE/$1" dst="$REPO/$1"
  [ -e "$src" ] || return 0
  if [ -e "$dst" ]; then
    if diff -rq "$src" "$dst" >/dev/null 2>&1; then ok "$1 (동일, 건너뜀)"; return 0; fi
    cp -r "$dst" "$dst.qa-bak"
    warn "$1 이미 존재 → $1.qa-bak 으로 백업"
  fi
  mkdir -p "$(dirname "$dst")"
  cp -r "$src" "$dst"
  ok "$1"
}
for f in CLAUDE.md LOOP.md TASKS.md PROGRESS.md BLOCKED.md \
         jest.config.js .env.example docs tests scripts .github; do
  copy "$f"
done
chmod +x "$REPO/scripts/verify.sh" "$REPO/scripts/loop.sh"

# ── 3. package.json 스크립트 주입 ───────────────────────
say "package.json 스크립트 추가"
node - "$REPO/package.json" <<'JS'
const fs = require("fs");
const p = process.argv[2];
const pkg = JSON.parse(fs.readFileSync(p, "utf8"));
pkg.scripts ||= {};
const want = {
  typecheck: "tsc --noEmit",
  test: "jest",
  "test:watch": "jest --watch",
  "test:static": "jest tests/query-keys.test.ts tests/env-guard.test.ts",
  "test:unit": "jest tests/pace.test.ts tests/validation.test.ts",
  verify: "./scripts/verify.sh",
};
let added = 0;
for (const [k, v] of Object.entries(want)) {
  if (!pkg.scripts[k]) { pkg.scripts[k] = v; added++; console.log("  \x1b[32m✓\x1b[0m " + k); }
  else console.log("  \x1b[33m!\x1b[0m " + k + " 이미 있음 (유지: " + pkg.scripts[k] + ")");
}
if (added) fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + "\n");
JS

# ── 4. .gitignore ───────────────────────────────────────
say ".gitignore"
if grep -qxF ".env" "$REPO/.gitignore" 2>/dev/null; then
  ok ".env 이미 등록됨"
else
  printf '\n# 로컬 환경변수 (커밋 금지)\n.env\n.env.local\n' >> "$REPO/.gitignore"
  ok ".env 추가"
fi

# ── 5. .env ─────────────────────────────────────────────
say ".env"
if [ -f "$REPO/.env" ]; then
  ok ".env 이미 존재"
else
  cp "$REPO/.env.example" "$REPO/.env"
  warn ".env 를 생성했습니다 — EXPO_PUBLIC_API_BASE_URL 에 실제 서버 주소를 넣어야 합니다."
  warn "비어 있으면 axiosInstance 가 모듈 로드 시점에 throw 해서 앱도 테스트도 안 돕니다."
fi

# ── 6. eas.json env 블록 ────────────────────────────────
say "eas.json"
node - "$REPO/eas.json" <<'JS' || true
const fs = require("fs");
const p = process.argv[2];
if (!fs.existsSync(p)) { console.log("  \x1b[33m!\x1b[0m eas.json 없음 — 건너뜀"); process.exit(0); }
const eas = JSON.parse(fs.readFileSync(p, "utf8"));
eas.build ||= {};
let touched = false;
for (const prof of ["development", "preview", "production"]) {
  eas.build[prof] ||= {};
  if (!eas.build[prof].env) {
    eas.build[prof].env = {
      EXPO_PUBLIC_API_BASE_URL: "",
      EXPO_PUBLIC_NAVER_MAP_CLIENT_ID: "",
      EXPO_PUBLIC_USE_MOCK: prof === "production" ? "false" : "true",
    };
    touched = true;
    console.log("  \x1b[32m✓\x1b[0m " + prof + ".env 블록 추가 (값은 비어 있음 — 채워야 함)");
  } else {
    console.log("  \x1b[33m!\x1b[0m " + prof + ".env 이미 있음 (유지)");
  }
}
if (touched) fs.writeFileSync(p, JSON.stringify(eas, null, 2) + "\n");
JS

# ── 7. 의존성 ───────────────────────────────────────────
say "테스트 의존성 설치"
cd "$REPO"
# Expo 54 / React 19.1.0 에 맞춰 버전을 고정한다.
#   jest-expo 를 열어두면 57 이 잡혀 react@^19.2.3 를 요구하다 ERESOLVE 로 죽는다.
#   react-test-renderer 도 React 와 정확히 같은 버전이어야 한다.
#   @testing-library/jest-native 는 deprecated — RNTL 13 에 매처가 내장돼 있어 넣지 않는다.
npm i -D --no-audit --no-fund \
  jest@~29.7.0 \
  jest-expo@~54.0.17 \
  @testing-library/react-native@^13.2.0 \
  react-test-renderer@19.1.0 \
  axios-mock-adapter@^2.1.0 \
  @types/jest@^29.5.14
ok "설치 완료"

# ── 8. 정적 게이트 실행 ─────────────────────────────────
say "정적 게이트 실행 (RN 런타임 불필요, 몇 초 소요)"
echo
set +e
npm run test:static
RC=$?
set -e
echo

cat <<'EOF'
════════════════════════════════════════════════════════════
EOF
if [ $RC -ne 0 ]; then
cat <<'EOF'
  ✅ 정상입니다. 빨간불이 나오는 게 맞습니다.

  tests/ 의 단언은 main 브랜치의 실제 결함을 고정한 것입니다.
  초록불로 만드는 유일한 방법은 src/ 와 app/ 을 고치는 것입니다.
  테스트를 고치면 verify.sh 의 게이트 무결성 검사가 잡아냅니다.
EOF
else
cat <<'EOF'
  ⚠️  초록불이 나왔습니다. 예상과 다릅니다.

  누군가 이미 고쳤거나, 스캐너가 결함을 못 잡고 있습니다.
  후자라면 루프를 켜지 마세요 — 게이트가 무른 상태입니다.
  docs/qa/qa-sheet.xlsx 의 결함목록과 실제 코드를 대조해 보세요.
EOF
fi
cat <<'EOF'

  다음 순서
  ─────────────────────────────────────────────────────────
  1. .env 에 EXPO_PUBLIC_API_BASE_URL 실제 값 입력
  2. eas.json 세 프로파일의 env 값 채우기
  3. docs/qa/qa-sheet.xlsx 열어서 결함목록 탭 읽기
  4. TASKS.md 의 QA-000 / QA-001 은 손으로 처리 (몇 분이면 끝남)
  5. MAX_ITER=12 ./scripts/loop.sh

  자세한 건 QUICKSTART.md 와 LOOP.md 를 보세요.
════════════════════════════════════════════════════════════
EOF
