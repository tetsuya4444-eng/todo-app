#!/bin/bash
# todo-add.sh - タスクを追加
# Claude Code から呼び出されるヘルパースクリプト
#
# 使い方:
#   ./scripts/todo-add.sh "タスクタイトル"
#   ./scripts/todo-add.sh "タスクタイトル" --priority 1 --due "2026-04-10"
#   ./scripts/todo-add.sh "タスクタイトル" --memo "補足メモ"

set -euo pipefail

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "Error: SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください"
  exit 1
fi

if [ -z "${SUPABASE_USER_ID:-}" ]; then
  echo "Error: SUPABASE_USER_ID を設定してください"
  exit 1
fi

TITLE="${1:-}"
if [ -z "$TITLE" ]; then
  echo "Error: タイトルを指定してください"
  echo "使い方: ./scripts/todo-add.sh \"タスクタイトル\" [--priority 1-3] [--due YYYY-MM-DD] [--memo \"メモ\"]"
  exit 1
fi
shift

PRIORITY=2
DUE_DATE="null"
MEMO=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --priority)
      PRIORITY="$2"
      shift 2
      ;;
    --due)
      DUE_DATE="\"${2}T23:59:00+09:00\""
      shift 2
      ;;
    --memo)
      MEMO="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

JSON_PAYLOAD=$(TITLE_VAL="$TITLE" MEMO_VAL="$MEMO" python3 -c "
import json, os
payload = {
    'user_id': os.environ.get('SUPABASE_USER_ID', ''),
    'title': os.environ['TITLE_VAL'],
    'memo': os.environ['MEMO_VAL'],
    'priority': int(os.environ.get('PRIORITY_VAL', '2')),
}
due = os.environ.get('DUE_DATE_VAL', 'null')
if due != 'null':
    payload['due_date'] = due.strip('\"')
print(json.dumps(payload))
" PRIORITY_VAL="$PRIORITY" DUE_DATE_VAL="$DUE_DATE")

RESULT=$(curl -s -w "\n%{http_code}" -X POST "${SUPABASE_URL}/rest/v1/todos" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "${JSON_PAYLOAD}")

HTTP_CODE=$(echo "$RESULT" | tail -1)
BODY=$(echo "$RESULT" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "タスクを追加しました: $TITLE"
else
  echo "Error: タスクの追加に失敗しました (HTTP $HTTP_CODE)"
  echo "$BODY"
  exit 1
fi
