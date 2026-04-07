# Todo App デザイントークン

作成日: 2026-04-07
作成者: Designer Agent

---

## 1. カラーパレット

### 設計方針

- グレースケールファーストで情報構造を構築し、色は意味を持たせて追加
- 使用色は4色以内（背景・文字・メイン・強調）
- メインカラーはティール系（青緑）。彩度を抑えた落ち着いたトーンで、紫グラデーション等のAI典型パターンを回避
- カテゴリカラーはくすみ系（パステル・ダスティ）で統一し、目に優しい配色とする
- 面積比: 背景70% / メイン25% / アクセント5%

### CSS変数定義

```css
:root {
  /* === メインカラー（ティール系・彩度を抑えた落ち着きトーン） === */
  --color-primary-50:  #EEF4F5;
  --color-primary-100: #D5E3E6;
  --color-primary-200: #A8C7CD;
  --color-primary-300: #7BADB6;
  --color-primary-400: #5D9BA6;
  --color-primary:     #4A8D9C;  /* メイン（くすみティール） */
  --color-primary-600: #3E7784;
  --color-primary-700: #33616C;
  --color-primary-800: #284B54;
  --color-primary-900: #1D363C;

  /* === 強調色（アンバー系・くすみゴールド） === */
  --color-accent:      #C4A265;
  --color-accent-light: #FAF3E6;
  --color-accent-dark:  #9E8350;

  /* === セマンティックカラー === */
  --color-error:       #B85C5C;
  --color-error-bg:    #FAF0F0;
  --color-success:     #5A8A6A;
  --color-success-bg:  #F0F7F2;
  --color-warning:     #B8865A;
  --color-warning-bg:  #FAF5F0;

  /* === 背景 === */
  --color-bg:          #FAFAFA;
  --color-bg-white:    #FFFFFF;
  --color-bg-subtle:   #F3F4F6;

  /* === テキスト === */
  --color-text:        #1A1A1A;
  --color-text-secondary: #6B7280;
  --color-text-tertiary:  #9CA3AF;
  --color-text-on-primary: #FFFFFF;

  /* === ボーダー === */
  --color-border:      #E5E7EB;
  --color-border-focus: #4A8D9C;

  /* === 優先度カラー === */
  --color-priority-high:   #B85C5C;
  --color-priority-medium: #C4A265;
  --color-priority-low:    #6B7280;
}
```

### カラー使用ルール

| 用途 | 変数 | 備考 |
|------|------|------|
| 主要アクション（ボタン、リンク） | `--color-primary` | 塗り or テキスト |
| 強調・注意喚起 | `--color-accent` | 期限切れ、バッジ等 |
| エラー表示 | `--color-error` + `--color-error-bg` | 背景を薄く、テキストを濃く |
| 成功表示 | `--color-success` + `--color-success-bg` | 同上 |
| 非活性・補足 | `--color-text-tertiary` | 完了済みタスク等 |

---

## 2. タイポグラフィ

### フォントファミリー

```css
:root {
  --font-family-base: "Inter", "Noto Sans JP", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-mono: "JetBrains Mono", "Fira Code", monospace;
}
```

- 本文用: Inter + Noto Sans JP（和欧混植、UDフォント系で可読性重視）
- コード用: JetBrains Mono（補足メモのマークダウンコードブロック用）
- フォントファミリーは2種類のみ

### タイプスケール

```css
:root {
  --font-size-xs:   0.75rem;  /* 12px - Caption */
  --font-size-sm:   0.875rem; /* 14px - Label */
  --font-size-base: 1rem;     /* 16px - Body（iOSズーム防止の最小値） */
  --font-size-lg:   1.125rem; /* 18px - Title */
  --font-size-xl:   1.25rem;  /* 20px - Headline（小） */
  --font-size-2xl:  1.5rem;   /* 24px - Headline */
}
```

| レベル | サイズ | ウェイト | 用途 |
|--------|--------|---------|------|
| Headline | 24px | 700 (Bold) | ページタイトル |
| Title | 18px | 600 (SemiBold) | セクション見出し |
| Body | 16px | 400 (Regular) | 本文、タスクタイトル |
| Label | 14px | 500 (Medium) | ボタン、タグ、フィルタ |
| Caption | 12px | 400 (Regular) | 日付、補足情報 |

### 行間・行幅

```css
:root {
  --line-height-tight: 1.2;   /* 見出し */
  --line-height-normal: 1.5;  /* 本文 */
  --line-height-relaxed: 1.7; /* 長文（補足メモ） */
}
```

---

## 3. スペーシング

### 4px基準スケール

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

### コンポーネント別スペーシング

| コンポーネント | パディング | マージン |
|--------------|-----------|---------|
| ボタン | 8px 16px（小） / 12px 24px（通常） | - |
| カード（タスクアイテム） | 12px 16px | 下 4px |
| 入力フィールド | 10px 12px | 下 16px |
| セクション間 | - | 24px |
| ページ余白（モバイル） | 16px | - |
| ページ余白（タブレット） | 24px | - |
| ページ余白（PC） | 32px | - |

---

## 4. ブレークポイント

```css
/* モバイル: デフォルト（~767px） */

/* タブレット */
@media (min-width: 768px) { }

/* PC */
@media (min-width: 1024px) { }
```

| カテゴリ | 幅 | カラム | ナビ | コンテンツ最大幅 |
|---------|-----|-------|------|----------------|
| モバイル | ~767px | 1列 | ボトムナビ（なし、4画面のため簡素化） | 100% |
| タブレット | 768~1023px | 1列（リスト）| ヘッダー固定 | 720px |
| PC | 1024px~ | 1列（リスト）+ サイドパネル可 | ヘッダー固定 | 960px |

### デバイス別設計方針

- **タブレット最優先**: iPad + キーボードでの操作感を最重視
- クイック入力バーはキーボードショートカット対応
- タスク一覧はスクロールリスト、フィルタは上部に常時表示
- PCではコンテンツ中央寄せ、最大幅制限

---

## 5. シャドウ

```css
:root {
  --shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md:  0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg:  0 4px 16px rgba(0, 0, 0, 0.10);
  --shadow-xl:  0 8px 32px rgba(0, 0, 0, 0.12);
}
```

| レベル | 用途 |
|--------|------|
| sm | タスクアイテム、入力フィールド |
| md | ヘッダー、フィルタバー |
| lg | FAB、ドロップダウン |
| xl | モーダル、ダイアログ |

---

## 6. 角丸（Border Radius）

```css
:root {
  --radius-sm:   4px;   /* 入力フィールド、テーブルセル */
  --radius-md:   8px;   /* カード、ボタン */
  --radius-lg:   12px;  /* モーダル */
  --radius-xl:   16px;  /* 大きめのカード */
  --radius-full: 9999px; /* チップ、タグ、アバター */
}
```

---

## 7. トランジション

```css
:root {
  --transition-fast:   120ms ease-out;
  --transition-normal: 200ms ease-out;
  --transition-slow:   300ms ease-out;
}
```

| 用途 | 速度 |
|------|------|
| ボタンのホバー・アクティブ | fast |
| フィルタの切り替え | normal |
| 画面遷移 | slow |

---

## 8. タッチターゲット

```css
:root {
  --touch-target-min: 44px;
  --touch-gap-min:    8px;
}
```

- 全てのインタラクティブ要素は最小44px x 44px
- インタラクティブ要素間の間隔は最低8px
- チェックボックス、アイコンボタンも44px確保（タップ領域拡張）

---

## 9. 画面遷移図

```
ログイン画面
  │
  ├─ [認証成功] → タスク一覧画面（メイン）
  │                 ├─ [クイック入力] → タスク作成（インライン）→ 一覧に反映
  │                 ├─ [FAB / 新規作成] → タスク作成/編集画面 → 一覧に戻る
  │                 ├─ [タスクタップ] → タスク作成/編集画面（編集モード）→ 一覧に戻る
  │                 └─ [設定アイコン] → 設定画面 → 一覧に戻る
  │
  └─ [セッション有効] → タスク一覧画面（直接遷移）
```

---

## 10. アイコン方針

- アイコンライブラリは使用しない（バンドルサイズ制約のため）
- インラインSVGで必要最小限のアイコンを自前定義
- サイズ: 16px（インライン）/ 20px（ボタン内）/ 24px（ナビ）
- アイコンには必ずテキストラベルを併記（設定アイコン等は `aria-label` で代替可）

### 使用アイコン一覧

| アイコン | 用途 | サイズ |
|---------|------|-------|
| チェックマーク | 完了チェックボックス | 20px |
| プラス | クイック入力、FAB | 24px |
| 設定（歯車） | 設定画面遷移 | 20px |
| メモ | 補足メモ有無 | 16px |
| カレンダー | 期限表示 | 16px |
| 矢印（上下） | 優先度表示 | 16px |
| 検索 | 検索バー | 20px |
| フィルタ | フィルタ切り替え | 20px |
| 戻る | 画面遷移 | 20px |
| ログアウト | ログアウト | 20px |
| ゴミ箱 | 削除 | 20px |
