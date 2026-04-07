-- =============================================
-- Todo App - Supabase セットアップSQL
-- =============================================
-- Supabase管理画面 > SQL Editor で実行してください
-- =============================================

-- 1. テーブル作成
-- =============================================

-- todos テーブル
CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  memo text,
  due_date timestamptz,
  priority smallint NOT NULL DEFAULT 2,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  reminder_minutes integer,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- categories テーブル
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#6B7280',
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- todo_categories 中間テーブル
CREATE TABLE IF NOT EXISTS todo_categories (
  todo_id uuid REFERENCES todos(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (todo_id, category_id)
);

-- 2. インデックス
-- =============================================

CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_todos_is_completed ON todos(is_completed) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- 3. updated_at 自動更新トリガー
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 4. 論理削除タスクの自動物理削除（10日後）
-- =============================================
-- Supabase の pg_cron 拡張を使用

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 毎日AM3:00（UTC）に実行: 削除後10日経過したタスクを物理削除
SELECT cron.schedule(
  'cleanup-deleted-todos',
  '0 3 * * *',
  $$
    DELETE FROM todos
    WHERE is_deleted = true
      AND deleted_at < now() - INTERVAL '10 days';
  $$
);

-- 5. Row Level Security (RLS)
-- =============================================

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

-- categories テーブル
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- todo_categories テーブル
ALTER TABLE todo_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own todo_categories"
  ON todo_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM todos
      WHERE todos.id = todo_categories.todo_id
        AND todos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own todo_categories"
  ON todo_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM todos
      WHERE todos.id = todo_categories.todo_id
        AND todos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own todo_categories"
  ON todo_categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM todos
      WHERE todos.id = todo_categories.todo_id
        AND todos.user_id = auth.uid()
    )
  );

-- =============================================
-- セットアップ完了
-- =============================================
