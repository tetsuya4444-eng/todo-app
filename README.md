# Todo App

Preact + Vite + Supabase で構築した軽量タスク管理アプリ。
PWA対応で、iPhone/iPad/PCからブラウザ経由で利用可能。

## セットアップ

### 前提条件

- Node.js 18+
- npm 9+

### インストール

```bash
cd 98_技術開発/10_プロジェクト/todo-app
npm install
```

### 環境変数

`.env.sample` を `.env` にコピーして、Supabase の接続情報を設定する。

```bash
cp .env.sample .env
```

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

環境変数を設定しない場合、デモモードで起動する（ダミーデータで動作確認可能）。

### 開発サーバー起動

```bash
npm run dev
```

http://localhost:5173 でアクセス可能。

### ビルド

```bash
npm run build
```

`dist/` に静的ファイルが生成される。

## 技術スタック

| 領域 | 技術 |
|------|------|
| フロントエンド | Preact 10 + Signals |
| ルーティング | preact-router |
| ビルド | Vite 5 |
| バックエンド | Supabase (PostgreSQL + Auth + REST API) |
| マークダウン | marked |
| PWA | vite-plugin-pwa |

## ディレクトリ構成

```
todo-app/
├── docs/               # 仕様書・デザイントークン・モックアップ
├── public/icons/       # PWAアイコン
├── scripts/            # Claude Code連携用シェルスクリプト
├── src/
│   ├── index.html      # エントリーHTML
│   ├── main.jsx        # エントリーポイント
│   ├── app.jsx         # ルーティング・トースト管理
│   ├── components/     # UIコンポーネント
│   ├── hooks/          # 状態管理（Signals）
│   ├── lib/            # Supabaseクライアント
│   └── styles/         # グローバルCSS
├── vite.config.js
└── package.json
```

## Claude Code 連携

`scripts/` 配下のシェルスクリプトを使用する。

```bash
# 環境変数を設定
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
export SUPABASE_USER_ID=your-user-uuid

# タスク一覧
./scripts/todo-list.sh
./scripts/todo-list.sh --today
./scripts/todo-list.sh --high

# タスク追加
./scripts/todo-add.sh "タスクタイトル" --priority 1 --due "2026-04-10"

# タスク完了
./scripts/todo-complete.sh --search "タスクタイトルの一部"

# Obsidianエクスポート
./scripts/todo-export-obsidian.sh --since 2026-04-01
```

## デプロイ（さくらサーバー）

```bash
npm run build
scp -r dist/* user@sakura-server:/path/to/document-root/
```
