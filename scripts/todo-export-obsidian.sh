#!/bin/bash
# todo-export-obsidian.sh - 完了タスクをObsidianにエクスポート
# Claude Code から呼び出されるヘルパースクリプト
#
# 使い方:
#   ./scripts/todo-export-obsidian.sh                    # 直近7日の完了タスク
#   ./scripts/todo-export-obsidian.sh --since 2026-04-01 # 指定日以降
#   ./scripts/todo-export-obsidian.sh --folder "99_その他" # 保存先フォルダ指定

set -euo pipefail

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "Error: SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください"
  exit 1
fi

if [ -z "${SUPABASE_USER_ID:-}" ]; then
  echo "Error: SUPABASE_USER_ID を設定してください"
  exit 1
fi

OBSIDIAN_BASE="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/obsidian-notes"
FOLDER="99_その他"
SINCE=$(date -u -v-7d +%Y-%m-%dT00:00:00Z 2>/dev/null || date -u -d "-7 days" +%Y-%m-%dT00:00:00Z)

while [[ $# -gt 0 ]]; do
  case $1 in
    --since)
      SINCE="${2}T00:00:00Z"
      shift 2
      ;;
    --folder)
      FOLDER="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# 完了タスクを取得
DATA=$(curl -s "${SUPABASE_URL}/rest/v1/todos?user_id=eq.${SUPABASE_USER_ID}&is_completed=eq.true&is_deleted=eq.false&completed_at=gte.${SINCE}&order=completed_at.desc" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")

TODAY=$(date +%Y%m%d)
OUTPUT_PATH="${OBSIDIAN_BASE}/${FOLDER}/${TODAY}_完了タスクアーカイブ.md"

# 環境変数経由でPythonにデータを渡す（インジェクション防止）
API_DATA="$DATA" OUTPUT_FILE="$OUTPUT_PATH" TODAY_VAL="$TODAY" python3 -c "
import json, os, sys

data = json.loads(os.environ['API_DATA'])

if not data:
    print('エクスポート対象の完了タスクがありません')
    sys.exit(0)

today = os.environ['TODAY_VAL']
output_path = os.environ['OUTPUT_FILE']

lines = []
lines.append(f'# 完了タスクアーカイブ - {today}')
lines.append('')
lines.append('## 完了タスク')
lines.append('')

for t in data:
    title = t.get('title', '')
    completed = t.get('completed_at', '')[:10] if t.get('completed_at') else ''
    memo = t.get('memo', '')
    lines.append(f'- [x] {title}（完了日: {completed}）')
    if memo:
        for m in memo.split('\n'):
            lines.append(f'  - {m}')
    lines.append('')

content = '\n'.join(lines)

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'エクスポート完了: {len(data)}件')
print(f'保存先: {output_path}')
" 2>/dev/null || echo "エクスポートに失敗しました。python3が必要です。"
