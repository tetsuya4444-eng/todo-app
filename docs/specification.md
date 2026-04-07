# Todo App 仕様書

作成日: 2026-04-07
作成者: Planner Agent
ステータス: 第2版（最終更新: 2026-04-07 21:45）

### 変更履歴

| 版 | 日付 | 変更内容 |
|---|------|---------|
| 初版 | 2026-04-07 | 新規作成 |
| 第2版 | 2026-04-07 | スマホ入力方法修正、Obsidian連携方針変更、削除を10日で自動物理削除に確定、補足メモのマークダウン対応追加、認証をメール+パスワード+セッション自動更新に変更 |

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| プロジェクト名 | Todo App（仮称） |
| 目的 | 日常のタスク管理とメモを一元化し、Claude Codeとの連携により情報の入出力を自動化する |
| 想定ユーザー | 個人利用（単一ユーザー） |
| 規模感 | 小（5画面以下） |
| 公開範囲 | インターネット公開（認証付き、本人のみ利用） |

### コンセプト

- **シンプル第一**: タスク管理と「忘れたくないこと」をポンポン入れられるアプリ
- **入力の手軽さ**: テキスト入力が基本。スマホでは文字入力・音声入力の両方を使用
- **一元管理**: タスクもメモも1つのアプリで完結。別アプリとの使い分けをなくす
- **Claude Code連携**: ブリーフィング時にTodo状況を自動的に把握し、結果を反映できる

---

## 2. ユーザー種別と利用シーン

### ユーザー種別

| 種別 | 誰か | 主な操作 | ITリテラシー |
|------|------|---------|-------------|
| 本人 | アプリオーナー | 全操作（CRUD、設定変更） | 高 |
| Claude Code | 自動連携 | Supabase API経由でのデータ読み書き | - |

### 利用シーン

| シーン | デバイス | 入力方法 | 主な操作 |
|--------|---------|---------|---------|
| 外出先で思いついたタスクを登録 | iPhone | 文字入力・音声入力 | タスク作成（テキスト＋補足メモ一括） |
| 自宅でタスクの整理・優先順位変更 | iPad + キーボード | キーボード入力 | 一覧確認、編集、カテゴリ整理 |
| 仕事中にPC画面を見ながら管理 | MacBook | キーボード入力 | ブラウザから一覧・編集 |
| 朝のブリーフィングでClaude Codeが確認 | - | API | 当日タスクの取得、リマインダー確認 |
| ブリーフィング結果をTodoに反映 | - | API | タスクの追加・更新 |
| Obsidianへの情報移行 | MacBook | Claude Code | Claude Codeとのやり取りの中で、必要に応じてタスク・メモをObsidianに書き出し |

---

## 3. 機能一覧

| # | 機能名 | 説明 | 優先度 | 備考 |
|---|--------|------|--------|------|
| 1 | タスク作成 | テキスト入力でタスクを作成。タイトル必須、他は任意 | 高 | |
| 2 | タスク一覧表示 | タスクをリスト表示。フィルタ・ソート対応 | 高 | |
| 3 | タスク編集 | タイトル、補足メモ、期限、優先度、カテゴリの編集 | 高 | |
| 4 | タスク削除 | 論理削除（ゴミ箱）。10日後に自動物理削除 | 高 | |
| 5 | 完了チェック | ワンタップ/ワンクリックで完了状態を切り替え | 高 | |
| 6 | 期限設定 | 日付ベースの期限設定。時刻指定は任意 | 高 | |
| 7 | 優先度設定 | 高・中・低の3段階 | 高 | |
| 8 | カテゴリ分け | ユーザー定義のカテゴリタグ。複数付与可 | 高 | |
| 9 | 補足メモ | タスクに紐づく長文テキスト。マークダウン対応（編集時テキスト入力、表示時レンダリング） | 高 | markedライブラリ使用（約7KB gzip） |
| 10 | リマインダー | 期限前の通知。PWA Push Notification | 中 | ブラウザの通知許可が必要 |
| 11 | フィルタ・ソート | カテゴリ、優先度、期限、完了状態で絞り込み・並べ替え | 中 | |
| 12 | 検索 | タイトル・補足メモの全文検索 | 中 | |
| 13 | Supabase認証 | 事前登録済みのメール＋パスワードによるログイン。セッション自動更新で2回目以降はログイン不要 | 高 | 新規登録UI不要。Supabase管理画面から1ユーザーのみ手動作成 |
| 14 | PWAインストール | ホーム画面追加、オフライン基本対応 | 中 | Service Workerによるキャッシュ |
| 15 | Claude Code API連携 | Supabase REST API経由でClaude Codeがデータ読み書き | 高 | |

---

## 4. 画面一覧

| # | 画面名 | 概要 | 対象デバイス |
|---|--------|------|-------------|
| 1 | ログイン画面 | メール＋パスワード認証 | 全デバイス |
| 2 | タスク一覧画面（メイン） | タスクのリスト表示、フィルタ、作成ボタン | 全デバイス |
| 3 | タスク作成/編集画面 | タスクの入力・編集フォーム | 全デバイス |
| 4 | 設定画面 | カテゴリ管理、通知設定 | 全デバイス |

### 画面遷移

```
ログイン → タスク一覧（メイン）
                ├→ タスク作成 → タスク一覧に戻る
                ├→ タスク詳細/編集 → タスク一覧に戻る
                └→ 設定 → タスク一覧に戻る
```

### 画面詳細

#### 4-1. ログイン画面
- メールアドレス入力欄
- パスワード入力欄
- ログインボタン
- 新規登録UIは不要（Supabase管理画面から1ユーザーのみ手動作成）
- セッション自動更新により、通常の利用では初回ログイン以降はこの画面に戻らない
- セッション切れ（長期間未使用等）の場合のみ再ログインが必要

#### 4-2. タスク一覧画面（メイン）
- **ヘッダー**: アプリ名、設定アイコン
- **クイック入力バー**: 画面上部に常駐。タイトルを入力してEnterで即作成
- **フィルタバー**: カテゴリ、優先度、完了/未完了の切り替え
- **タスクリスト**: 各タスクは以下を表示
  - 完了チェックボックス
  - タイトル
  - 期限（あれば。期限切れは視覚的に強調）
  - 優先度アイコン
  - カテゴリタグ
  - 補足メモの有無アイコン
- **FAB（フローティングアクションボタン）**: タスク作成画面へ遷移（スマホ向け）
- ソート: 期限順（デフォルト）、優先度順、作成日順

#### 4-3. タスク作成/編集画面
- タイトル入力（必須）
- 補足メモ入力（テキストエリア、長文対応、マークダウン記法可）
- 期限設定（日付ピッカー、時刻は任意）
- 優先度選択（高/中/低、デフォルト: 中）
- カテゴリ選択（チップ形式、複数選択可）
- リマインダー設定（期限の何分前/何時間前/何日前）
- 保存ボタン / キャンセルボタン

#### 4-4. 設定画面
- カテゴリの追加・編集・削除
- 通知のON/OFF
- ログアウトボタン

---

## 5. データモデル（Supabaseテーブル設計）

### 5-1. todos テーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | uuid | PK, default: gen_random_uuid() | タスクID |
| user_id | uuid | FK(auth.users), NOT NULL | ユーザーID |
| title | text | NOT NULL | タスクタイトル |
| memo | text | | 補足メモ（長文テキスト） |
| due_date | timestamptz | | 期限日時 |
| priority | smallint | NOT NULL, default: 2 | 優先度（1:高, 2:中, 3:低） |
| is_completed | boolean | NOT NULL, default: false | 完了フラグ |
| completed_at | timestamptz | | 完了日時 |
| is_deleted | boolean | NOT NULL, default: false | 論理削除フラグ |
| deleted_at | timestamptz | | 削除日時（10日後に自動物理削除） |
| reminder_minutes | integer | | 期限の何分前にリマインド |
| sort_order | integer | default: 0 | 手動ソート用 |
| created_at | timestamptz | NOT NULL, default: now() | 作成日時 |
| updated_at | timestamptz | NOT NULL, default: now() | 更新日時 |

### 5-2. categories テーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | uuid | PK, default: gen_random_uuid() | カテゴリID |
| user_id | uuid | FK(auth.users), NOT NULL | ユーザーID |
| name | text | NOT NULL | カテゴリ名 |
| color | text | default: '#6B7280' | 表示色（HEXカラーコード） |
| sort_order | integer | default: 0 | 表示順 |
| created_at | timestamptz | NOT NULL, default: now() | 作成日時 |

### 5-3. todo_categories テーブル（中間テーブル）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| todo_id | uuid | FK(todos), NOT NULL | タスクID |
| category_id | uuid | FK(categories), NOT NULL | カテゴリID |

- PK: (todo_id, category_id) の複合キー

### インデックス

```sql
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_due_date ON todos(due_date) WHERE is_deleted = false;
CREATE INDEX idx_todos_is_completed ON todos(is_completed) WHERE is_deleted = false;
CREATE INDEX idx_categories_user_id ON categories(user_id);
```

---

## 6. API設計（Supabase RLS）

### Row Level Security ポリシー

全テーブルに RLS を有効化し、ユーザーは自分のデータのみアクセス可能とする。

```sql
-- todos テーブル
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);

-- categories テーブル（同様のポリシー）
-- todo_categories テーブル（todosのuser_idを通じた間接チェック）
```

### Supabase REST API エンドポイント

Supabase が自動生成する REST API を利用する。独自APIサーバーは不要。

| 操作 | メソッド | エンドポイント | 用途 |
|------|---------|---------------|------|
| タスク一覧取得 | GET | /rest/v1/todos?is_deleted=eq.false&order=due_date | 一覧取得（フィルタ付き） |
| タスク作成 | POST | /rest/v1/todos | 新規タスク作成 |
| タスク更新 | PATCH | /rest/v1/todos?id=eq.{id} | タスクの編集・完了切り替え |
| タスク削除 | PATCH | /rest/v1/todos?id=eq.{id} | 論理削除（is_deleted=true） |
| カテゴリ一覧 | GET | /rest/v1/categories | カテゴリ一覧取得 |
| カテゴリ操作 | POST/PATCH/DELETE | /rest/v1/categories | カテゴリのCRUD |

### 認証ヘッダー

```
Authorization: Bearer {access_token}
apikey: {anon_key}
```

Claude Code からのアクセスには Service Role Key を使用する（RLS をバイパス）。

---

## 7. 技術スタック詳細

| 領域 | 技術 | 選定理由 |
|------|------|---------|
| フロントエンド | **Preact + HTM** | タブレットでのパフォーマンス最優先。React互換APIで開発効率を保ちつつ、バンドルサイズを3KB程度に抑える。HTMによりビルドステップなしでJSX相当の記述が可能 |
| スタイリング | **Vanilla CSS（CSS Modules相当）** | 軽量性重視。CSSフレームワーク非使用。CSS変数でテーマ管理 |
| ルーティング | **preact-router** | 軽量ルーター。4画面程度なので十分 |
| 状態管理 | **Preact Signals** | Preact公式の軽量状態管理。追加バンドル最小 |
| バックエンド | **Supabase** | DB + 認証 + REST API が一体。サーバーサイドコード不要 |
| データベース | **Supabase (PostgreSQL)** | RLSによるセキュリティ、REST APIの自動生成 |
| マークダウン | **marked** | 補足メモのマークダウンレンダリング。約7KB gzipで軽量 |
| 認証 | **Supabase Auth** | メール＋パスワード認証。セッション自動更新で2回目以降ログイン不要 |
| ビルドツール | **Vite** | 高速ビルド。Preact用プラグインあり。さくらサーバー向けに静的ビルド出力 |
| ホスティング | **さくらインターネット レンタルサーバー** | 既存契約の活用。静的ファイル配信のみで動作 |
| PWA | **Vite PWA Plugin** | Service Worker生成、マニフェスト管理を自動化 |

### 技術選定の判断根拠

**Preact を選択した理由:**
- タブレットでのキーボード入力パフォーマンスが最優先要件
- React のAPI互換性があるため学習コスト・開発効率への影響が小さい
- 本番バンドルサイズが React の約1/10（約3KB vs 約40KB）
- HTM と組み合わせることで、ビルドなしでも動作可能な柔軟性を確保

**Supabase を選択した理由:**
- バックエンドサーバーを立てずに DB + 認証 + API を一括提供
- REST API が自動生成されるため、Claude Code からの連携が容易
- RLS でセキュリティを担保しつつ、Service Role Key で管理操作も可能
- Free tier で個人利用には十分

**さくらサーバーを選択した理由:**
- 既存契約があり追加コスト不要
- 静的ファイルのホスティングのみなので、レンタルサーバーで十分
- Supabase が API サーバーを担うため、サーバーサイド処理は不要

---

## 8. Claude Code 連携仕様

### 8-1. 接続方式

Claude Code は Supabase REST API に直接アクセスする。Service Role Key を使用して RLS をバイパスする。

```bash
# 環境変数（Claude Codeの実行環境に設定）
SUPABASE_URL=https://{project-id}.supabase.co
SUPABASE_SERVICE_ROLE_KEY={service_role_key}
```

### 8-2. 連携ユースケース

#### ブリーフィング時のTodo読み取り

```bash
# 当日が期限のタスク取得
curl -s "${SUPABASE_URL}/rest/v1/todos?due_date=lte.$(date -u +%Y-%m-%dT23:59:59Z)&is_completed=eq.false&is_deleted=eq.false" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}"

# 高優先度の未完了タスク取得
curl -s "${SUPABASE_URL}/rest/v1/todos?priority=eq.1&is_completed=eq.false&is_deleted=eq.false" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}"
```

#### ブリーフィング結果のTodo反映

```bash
# 新規タスク追加
curl -s -X POST "${SUPABASE_URL}/rest/v1/todos" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "{user_uuid}", "title": "...", "priority": 1, "due_date": "..."}'
```

#### Obsidian連携（必要に応じた書き出し）

Claude Code とのやり取りの中で、ユーザーが必要と判断したタスク・メモをObsidianに書き出す。全タスクの自動移行ではなく、会話の中で都度判断する。

```
Obsidian保存先: ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/obsidian-notes/
```

保存フォーマット:
```markdown
# 完了タスクアーカイブ - YYYY-MM-DD

## 完了タスク
- [x] タスクタイトル（完了日: YYYY-MM-DD）
  - メモ: 補足テキスト
```

### 8-3. Claude Code用ヘルパースクリプト

プロジェクト内に `scripts/` フォルダを作成し、Claude Codeが利用するシェルスクリプトを配置する。

| スクリプト | 用途 |
|-----------|------|
| `todo-list.sh` | 未完了タスク一覧を取得 |
| `todo-add.sh` | タスクを追加 |
| `todo-complete.sh` | タスクを完了 |
| `todo-export-obsidian.sh` | 完了タスクをObsidianにエクスポート |

---

## 9. PWA設定

### Web App Manifest

```json
{
  "name": "Todo App",
  "short_name": "Todo",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker 方針

- **キャッシュ戦略**: Network First（API通信）、Cache First（静的アセット）
- **オフライン対応**: 最小限。オフライン時は直前のキャッシュデータを表示し、操作はオンライン復帰後に同期
- **Push通知**: リマインダー用。Supabase Edge Functions からの通知トリガーを検討（中優先度）

### iPhoneでの注意点

- iOS Safari の PWA は Push 通知に制限あり（iOS 16.4以降で一部対応）
- スプラッシュ画面用の apple-touch-icon を設定
- `<meta name="apple-mobile-web-app-capable" content="yes">` を設定

---

## 10. デプロイ計画（さくらサーバー）

### ビルド・デプロイフロー

```
[ローカル開発] → [Vite build] → [静的ファイル生成] → [さくらサーバーにアップロード]
```

1. `npm run build` で `dist/` フォルダに静的ファイルを生成
2. SCP/SFTP でさくらサーバーにアップロード
3. サーバー側は Apache で静的ファイルを配信

### Apache設定（.htaccess）

```apache
# SPA対応（全リクエストをindex.htmlにルーティング）
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# キャッシュ設定
<IfModule mod_headers.c>
  # 静的アセットは長期キャッシュ（ハッシュ付きファイル名のため安全）
  <FilesMatch "\.(js|css|png|jpg|gif|svg|ico|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  # index.htmlはキャッシュしない
  <FilesMatch "index\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
</IfModule>

# HTTPS強制
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

### デプロイ用スクリプト

```bash
#!/bin/bash
# deploy.sh - さくらサーバーへのデプロイ
npm run build
scp -r dist/* {user}@{sakura-server}:{document-root}/
```

---

## 11. 非機能要件

| 項目 | 要件 |
|------|------|
| レスポンシブ対応 | 3ブレークポイント: モバイル(~767px), タブレット(768~1023px), PC(1024px~) |
| パフォーマンス | タブレットでの初回読み込み1秒以内（目標）。バンドルサイズ50KB以下（gzip後） |
| セキュリティ | Supabase Auth + RLS。HTTPS必須。Service Role Key はサーバー環境変数で管理 |
| 多言語対応 | 日本語のみ |
| アクセシビリティ | 基本的なaria属性、キーボード操作対応 |
| バックアップ | Supabase側の自動バックアップに依存 |
| ログ | Supabase Dashboard でクエリログ確認可能 |

---

## 12. ディレクトリ構成（案）

```
todo-app/
├── docs/
│   └── specification.md     ← 本ファイル
├── src/
│   ├── index.html
│   ├── main.jsx             ← エントリーポイント
│   ├── app.jsx              ← ルーティング定義
│   ├── components/
│   │   ├── TaskList.jsx      ← タスク一覧
│   │   ├── TaskItem.jsx      ← タスク1行
│   │   ├── TaskForm.jsx      ← 作成/編集フォーム
│   │   ├── QuickInput.jsx    ← クイック入力バー
│   │   ├── FilterBar.jsx     ← フィルタバー
│   │   └── Settings.jsx      ← 設定画面
│   ├── hooks/
│   │   ├── useTodos.js       ← タスクCRUDロジック
│   │   ├── useCategories.js  ← カテゴリ管理
│   │   └── useAuth.js        ← 認証状態管理
│   ├── lib/
│   │   └── supabase.js       ← Supabaseクライアント初期化
│   └── styles/
│       └── global.css        ← グローバルスタイル
├── public/
│   ├── icons/
│   └── manifest.json
├── scripts/
│   ├── todo-list.sh
│   ├── todo-add.sh
│   ├── todo-complete.sh
│   ├── todo-export-obsidian.sh
│   └── deploy.sh
├── vite.config.js
├── package.json
└── README.md
```

---

## Planner記入欄

### 設計判断メモ

1. **Preact + HTM の採用**: ユーザーの最優先要件が「タブレットでのキーボード入力のサクサク感」であるため、バンドルサイズと実行時パフォーマンスの最小化を優先した。Next.jsはSSR/SSGの恩恵があるが、Supabaseをバックエンドにする場合は過剰であり、さくらサーバーのApache環境との相性も悪い。

2. **静的ファイル＋Supabase構成**: さくらサーバー（Apache）でフロントを配信し、バックエンドはSupabaseに完全委譲する。これによりサーバーサイドのコード管理が不要になり、デプロイもSCPのみで完結する。

3. **論理削除の採用**: 物理削除ではなく論理削除（is_deleted フラグ）を採用。誤削除からの復元を可能にしつつ、Claude Codeからのデータ参照時にも一貫性を保つ。

4. **Claude Code連携はService Role Key**: RLS をバイパスすることで、Claude Code側の認証フローを簡素化する。セキュリティはService Role Keyの厳重管理で担保する。

5. **メモ機能はタスクの補足テキストとして統合**: 独立した「メモ」エンティティを作らず、タスクの `memo` フィールドとして統合する。タスクとメモの境界が曖昧な使い方（「忘れたくないことをポンポン入れる」）に最適化するため。期限なし・カテゴリ「メモ」のタスクが実質的にメモとして機能する。

### 未確定事項

1. **リマインダーの実装方式**: Push通知の実装はSupabase Edge Functions + Web Push APIの組み合わせが候補だが、iOSでの制約がある。プロトタイプで検証が必要。
2. **さくらサーバーのドメイン・ディレクトリ**: 配置先のドメインやディレクトリパスは未確定。
3. **Supabaseプロジェクトの作成**: プロジェクトID、APIキーなどは実装フェーズで確定する。
4. **オフライン時の操作キュー**: オフライン時に行った操作をオンライン復帰時に同期する仕組みの詳細は、プロトタイプで検証後に決定する。
5. **論理削除タスクの自動物理削除**: 削除後10日で自動物理削除（確定）。Supabase の pg_cron または Edge Functions で定期実行。
