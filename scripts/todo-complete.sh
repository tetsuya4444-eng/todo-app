#!/bin/bash
# todo-complete.sh - タスクを完了にする
# Claude Code から呼び出されるヘルパースクリプト
#
# 使い方:
#   ./scripts/todo-complete.sh "タスクID"
#   ./scripts/todo-complete.sh --search "タスクタイトルの一部"

set -euo pipefail

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "Error: SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください"
  exit 1
fi

if [ -z "${SUPABASE_USER_ID:-}" ]; then
  echo "Error: SUPABASE_USER_ID を設定してください"
  exit 1
fi

MODE="id"
TARGET=""

case "${1:-}" in
  --search)
    MODE="search"
    TARGET="${2:-}"
    if [ -z "$TARGET" ]; then
      echo "Error: 検索キーワードを指定してください"
      exit 1
    fi
    ;;
  *)
    TARGET="${1:-}"
    if [ -z "$TARGET" ]; then
      echo "Error: タスクIDまたは --search キーワード を指定してください"
      exit 1
    fi
    ;;
esac

if [ "$MODE" = "search" ]; then
  # タイトルで検索して最初のマッチを完了にする
  ENCODED_TARGET=$(SEARCH_VAL="$TARGET" python3 -c "import urllib.parse, os; print(urllib.parse.quote(os.environ['SEARCH_VAL']))")
  SEARCH_RESULT=$(curl -s "${SUPABASE_URL}/rest/v1/todos?title=ilike.*${ENCODED_TARGET}*&is_completed=eq.false&is_deleted=eq.false&user_id=eq.${SUPABASE_USER_ID}&limit=1" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")

  TODO_ID=$(echo "$SEARCH_RESULT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['id'] if d else '')" 2>/dev/null)
  TODO_TITLE=$(echo "$SEARCH_RESULT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['title'] if d else '')" 2>/dev/null)

  if [ -z "$TODO_ID" ]; then
    echo "Error: \"${TARGET}\" に一致する未完了タスクが見つかりません"
    exit 1
  fi

  echo "タスクを完了にします: $TODO_TITLE (ID: $TODO_ID)"
  TARGET="$TODO_ID"
fi

NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

RESULT=$(curl -s -w "\n%{http_code}" -X PATCH \
  "${SUPABASE_URL}/rest/v1/todos?id=eq.${TARGET}&user_id=eq.${SUPABASE_USER_ID}" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"is_completed\": true, \"completed_at\": \"${NOW}\", \"updated_at\": \"${NOW}\"}")

HTTP_CODE=$(echo "$RESULT" | tail -1)

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "完了しました"
else
  echo "Error: 完了処理に失敗しました (HTTP $HTTP_CODE)"
  exit 1
fi
