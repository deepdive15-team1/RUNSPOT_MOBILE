#!/usr/bin/env bash
# 이것이 "완료"의 유일한 정의다. 에이전트의 자기 보고는 믿지 않는다.
set -euo pipefail

echo "▸ typecheck"; npm run typecheck
echo "▸ lint";      npm run lint
echo "▸ format";    npm run format:check

echo "▸ 게이트 무결성 ★"
# QA 루프의 핵심. 테스트를 무르게 만들어 초록불을 얻는 걸 막는다.
if ! git diff --quiet HEAD -- tests/ docs/ scripts/ CLAUDE.md LOOP.md; then
  echo "❌ FATAL: worker가 게이트(tests/ docs/ scripts/)를 수정했다."
  git checkout HEAD -- tests/ docs/ scripts/ CLAUDE.md LOOP.md
  exit 1
fi

echo "▸ 테스트 무력화 검사 ★"
if grep -rInE '\b(it|test|describe)\.(skip|todo|only)\b|xit\(|xdescribe\(' tests/ 2>/dev/null | grep -q .; then
  echo "❌ FATAL: 테스트가 skip/only 처리되었다."
  grep -rInE '\b(it|test|describe)\.(skip|todo|only)\b|xit\(|xdescribe\(' tests/
  exit 1
fi

echo "▸ 타입 우회 검사 ★"
if grep -rInE '@ts-ignore|@ts-expect-error|eslint-disable' src/ app/ 2>/dev/null | grep -q .; then
  echo "❌ FATAL: 타입/린트 억제 주석으로 게이트를 덮었다."
  grep -rInE '@ts-ignore|@ts-expect-error|eslint-disable' src/ app/
  exit 1
fi

echo "▸ 🔑 시크릿 노출 검사 ★"
# .env 가 커밋되면 API 베이스 URL·지도 키가 저장소에 박힌다
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
  echo "❌ FATAL: .env 가 커밋되어 있다."
  exit 1
fi

echo "▸ 모킹 스위치 검사 ★"
# EXPO_PUBLIC_USE_MOCK 은 *.index.ts 밖에서 읽으면 안 된다
if grep -rIl --include='*.ts' --include='*.tsx' 'EXPO_PUBLIC_USE_MOCK' src/ app/ 2>/dev/null \
   | grep -v '\.index\.ts$' | grep -q .; then
  echo "❌ FATAL: EXPO_PUBLIC_USE_MOCK 이 index 스위처 밖에서 읽힌다."
  exit 1
fi

echo "▸ console.log 검사"
if grep -rInE 'console\.log\(' src/ app/ 2>/dev/null | grep -q .; then
  echo "❌ 디버그 로그가 남아있다."
  grep -rInE 'console\.log\(' src/ app/
  exit 1
fi

echo "▸ 정적 테스트 (RN 런타임 불필요)"; npm run test:static
echo "▸ 단위 · 통합 (KST)"; TZ=Asia/Seoul npm test -- --ci --maxWorkers=2
echo "▸ 단위 · 통합 (UTC)"; TZ=UTC       npm test -- --ci --maxWorkers=2

echo "✅ VERIFY PASS"
echo "⚠️  E2E(Maestro)는 기기가 필요해 여기서 안 돈다. M1 종료 후 사람이 직접 실행할 것."
