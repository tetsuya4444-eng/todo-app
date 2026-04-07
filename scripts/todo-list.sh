#!/bin/bash
# todo-list.sh - 未完了タスク一覧を取得
# Claude Code から呼び出されるヘルパースクリプト
#
# 使い方:
#   ./scripts/todo-list.sh           # 全未完了タスク
#   ./scripts/todo-list.sh --today   # 今日が期限のタスク
#   ./scripts/todo-list.sh --high    # 高優先度タスク

set -euo pipefail

# 環境変数チェック
if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "Error: SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください"
  exit 1
fi

if [ -z "${SUPABASE_USER_ID:-}" ]; then
  echo "Error: SUPABASE_USER_ID を設定してください"
  exit 1
fi

FILTER="user_id=eq.${SUPABASE_USER_ID}&is_completed=eq.false&is_deleted=eq.false"

case "${1:-}" in
  --today)
    TODAY=$(date -u +%Y-%m-%dT00:00:00Z)
    TOMORROW=$(date -u -v+1d +%Y-%m-%dT00:00:00Z 2>/dev/null || date -u -d "+1 day" +%Y-%m-%dT00:00:00Z)
    FILTER="${FILTER}&due_date=gte.${TODAY}&due_date=lt.${TOMORROW}"
    ;;
  --high)
    FILTER="${FILTER}&priority=eq.1"
    ;;
  --overdue)
    NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    FILTER="${FILTER}&due_date=lt.${NOW}"
    ;;
esac

curl -s "${SUPABASE_URL}/rest/v1/todos?${FILTER}&order=due_date.asc.nullslast,priority.asc" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Accept: application/json" | \
  python3 -c "
import json, sys
data = json.load(sys.stdin)
if not data:
    print('未完了タスクはありません')
    sys.exit(0)

priorities = {1: '高', 2: '中', 3: '低'}
for t in data:
    pri = priorities.get(t.get('priority', 2), '中')
    due = t.get('due_date', '')
    if due:
        due = due[:10]
    else:
        due = '期限なし'
    title = t.get('title', '')
    memo_flag = ' [メモ有]' if t.get('memo') else ''
    print(f'[{pri}] {title} ({due}){memo_flag}')
print(f'\n合計: {len(data)}件')
" 2>/dev/null || echo "JSONパースに失敗しました。python3が必要です。"
