#!/usr/bin/env bash
# QA 루프 드라이버. 매 이터레이션 새 세션. --continue 안 쓴다.
set -uo pipefail
MAX_ITER="${MAX_ITER:-12}"
MAX_RETRY=3

if [ ! -f .env ]; then
  echo "🛑 .env 가 없다. axiosInstance 가 모듈 로드 시점에 throw 한다."
  echo "   cp .env.example .env 후 실제 값을 채워라. (LOOP.md 4번)"
  exit 1
fi

for i in $(seq 1 "$MAX_ITER"); do
  echo "════════ ITERATION $i / $MAX_ITER ════════"

  if [ -s BLOCKED.md ]; then
    echo "🛑 BLOCKED. 사람이 필요하다:"; cat BLOCKED.md; exit 2
  fi
  if ! grep -q '^\- \[ \] TODO' TASKS.md; then
    echo "🎉 모든 태스크 완료"; exit 0
  fi

  claude -p "/next-task" --permission-mode acceptEdits

  attempt=1
  until ./scripts/verify.sh; do
    if [ "$attempt" -ge "$MAX_RETRY" ]; then
      echo "❌ ${MAX_RETRY}회 실패 → BLOCKED"
      claude -p "/give-up verify를 3회 실패했다. BLOCKED.md에 원인과 시도를 기록하고 TASKS.md를 BLOCKED로 바꿔라. 코드는 고치지 마라."
      git reset --hard HEAD
      exit 2
    fi
    echo "🔁 verify 실패 → 수정 $attempt/$MAX_RETRY"
    claude -p "/fix-verify" --permission-mode acceptEdits
    attempt=$((attempt+1))
  done

  git add -A && git commit -m "qa: iteration $i" || true
  echo "✅ iteration $i 통과"
done
echo "⏹ MAX_ITER 도달"
