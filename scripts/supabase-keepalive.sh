#!/bin/bash
# supabase-keepalive.sh - Supabase無料プランの7日間停止を防止
# 全Supabaseプロジェクトに対して定期的にAPIを叩いてアクティブに保つ

# プロジェクト一覧（名前 URL ANON_KEY）
declare -a PROJECTS=(
  "todo-app|https://donlqdxfnyrwdosojvnh.supabase.co|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvbmxxZHhmbnlyd2Rvc29qdm5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzMxNDQsImV4cCI6MjA5MTEwOTE0NH0.zdRHJmgBy8ujEe9xT6O4Pp7qWafR4XURciCYpgCJb18"
  "betsukai-tfc|https://lpcuosvjyumqjxdfshar.supabase.co|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwY3Vvc3ZqeXVtcWp4ZGZzaGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzODE3NDYsImV4cCI6MjA4OTk1Nzc0Nn0.i0P6kcbJMmnbDnXAUyeQvquYedhw4JuB-4cJURYOlIE"
)

echo "=== Supabase Keepalive $(date) ==="

for PROJECT in "${PROJECTS[@]}"; do
  IFS='|' read -r NAME URL KEY <<< "$PROJECT"

  RESULT=$(curl -s -o /dev/null -w "%{http_code}" \
    "${URL}/rest/v1/" \
    -H "apikey: ${KEY}" \
    -H "Authorization: Bearer ${KEY}")

  if [ "$RESULT" = "200" ] || [ "$RESULT" = "401" ]; then
    echo "  [OK]   ${NAME} (HTTP ${RESULT})"
  else
    echo "  [WARN] ${NAME} (HTTP ${RESULT})"
  fi
done

echo "=== 完了 ==="
